import agent from "superagent";

const headers = { Accept: 'application/json, application/xml, text/plain, text/html, *.*' };

function setHeader(key, value) {
  if (value === null || value === undefined) {
    delete headers[key];
    return;
  }
  headers[key] = value;
}

////////////////////////////////////////////////////////////////////////
// HELPERS


function makeUrl(scope) {
  const q = [];
  const useLocal = process.env.API_CLI_HOST_USE_LOCAL === 'true';
  const hostUrl = useLocal 
    ? process.env.API_CLI_HOST_LOCAL_URL
    : process.env.API_CLI_HOST_REMOTE_URL;

  return hostUrl + scope.route + (q.length ? '?' : '') + q.join('&');
}
function makeHandler(scope) {
  // default response handler
  return (response) => {
    try {
      if (!response.body.ok) throw new Error(response.body.message);
      scope.resolve(response.body.data);
    }
    catch (ex) {
      scope.reject(ex);
    }
  }
}
////////////////////////////////////////////////////////////////////////


function POST(route, data, options) {
  return new Promise((resolve, reject) => {

    const scope = { method: 'POST', route, data, options: options||{}, resolve, reject };
    const url = makeUrl(scope);

    agent
      .post(url)
      .send(data)
      .set({ ...headers, ...scope.options.headers })
      .catch(err => reject(err))
      .then(makeHandler(scope))
  });  
}

function PUT(route, data, options) {
  return new Promise((resolve, reject) => {
    const scope = { method: 'PUT', route, data, options: options||{}, resolve, reject };
    const url = makeUrl(scope);
    agent
      .put(url)
      .send(data)
      .set({ ...headers, ...scope.options.headers })
      .catch(err => reject(err))
      .then(makeHandler(scope))
  });  
}

function GET(route, options) {
  return new Promise((resolve, reject) => {
    const scope = { method: 'GET', route, data: undefined, options: options||{}, resolve, reject };
    const url = makeUrl(scope);
    agent
      .get(url)
      .set({ ...headers, ...scope.options.headers })
      .catch(err => reject(err))
      .then(makeHandler(scope))
  });  
}

function DEL(route, data, options) {
  return new Promise((resolve, reject) => {
    const scope = { method: 'DELETE', route, data, options: options||{}, resolve, reject };
    const url = makeUrl(scope);
    agent
      .delete(url)
      .send(data)
      .set({ ...headers, ...scope.options.headers })
      .catch(err => reject(err))
      .then(makeHandler(scope))
  });  
}

export default {
  setHeader,
  POST,
  PUT,
  GET,
  DEL,
}