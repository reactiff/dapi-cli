/* eslint-disable */
import _ from 'lodash';
import agent from "superagent";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

import store from './store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });


///////////////////////////////////////////////////////////////// HELPERS

function encodeQueryValue(value) {
  const result = typeof value === 'object'
    ? JSON.stringify(value)
    : value;
  const encoded = encodeURIComponent(result)
  return encoded;
}

function handleExpectedFailure(scope) {
  return (response) => {
    try {
      if (response.body.ok) {
        throw new Error('Expected to fail here');
      }
      scope.resolve(response.body.data);
    }
    catch (ex) {
      scope.reject(ex);
    }
  }
}

function handleSuccess(scope) {
  return (response) => {
    try {
      if (!response.body.ok) {
        throw new Error('Server error: ' + response.body.message);
      }
      scope.resolve(response.body.data);
    }
    catch (ex) {
      scope.reject(ex);
    }
  }
}

function makeHandler(scope) {
  if (scope.options.expectToFail) {
    return handleExpectedFailure(scope);
  }
  return handleSuccess(scope);
}

export function toParams(object, type) {
  const keys = [
    ...Object.keys(type.fields).filter(k => k.startsWith('_')),
    ...type.shardKeys,
  ];
  const stripped = _.pick(object, keys);
  return stripped;
}

///////////////////////////////////////////////////////////////////////



class AppClient {
  
  headers = { Accept: 'application/json, application/xml, text/plain, text/html, *.*' };

  constructor(agent, name, id) {
    this.agent = agent;
    this.name = name;
    this.appId = id;
  }

  terminate() {
    delete this.agent;
  }

  setHeader(key, value) {
    if (value === null || value === undefined) {
      delete this.headers[key];
      return;
    }
    this.headers[key] = value;
  }

  enableDebugging() {
    this.setHeader('debug', 'true');
  }

  disableDebugging() {
    delete this.headers.debug;
  }

  debugOnce() {
    this.setHeader('debug', 'true');
    this.debuggingOnce = true;
  }
  ///////////////

  getHostUrl() {
    
    const useLocal = store.get('useLocal');
    const port = store.get('port');
    if (useLocal && !port) throw new Error(`Local port not set.  Run 'meta set port <number>`);
    return useLocal 
      ? `http://localhost/` + port
      : process.env.API_CLI_HOST_REMOTE_URL;
  }

  makeUrl(scope) {
    const query = scope.options.parent || scope.options.query || {};
    const q = Object.entries(query)
      .map(kv => {
        const [key, value] = kv;
        return `${key}=${encodeQueryValue(value)}`;
      });
      
    const hostUrl = this.getHostUrl();

    return hostUrl + '/' + this.appId + scope.route + (q.length ? '?' : '') + q.join('&');
  }

    
  POST(route, data, options) {
    const _this = this;
    return new Promise((resolve, reject) => {
      const scope = { method: 'POST', route, data, options: options||{}, resolve, reject };
      const url = _this.makeUrl(scope);
      this.agent
        .post(url)
        .send(data)
        .set({ ..._this.headers, ...scope.options.headers })
        .catch(err => reject(err))
        .then(makeHandler(scope));
      
      if (this.debuggingOnce && this.headers.debug) {
        delete this.headers.debug;
        this.debuggingOnce = false;
      }

    });  
  }

  PUT(route, data, options) {
    const _this = this;
    return new Promise((resolve, reject) => {
      const scope = { method: 'PUT', route, data, options: options||{}, resolve, reject };
      const url = _this.makeUrl(scope);
      this.agent
        .put(url)
        .send(data)
        .set({ ..._this.headers, ...scope.options.headers })
        .catch(err => reject(err))
        .then(makeHandler(scope));

      if (this.debuggingOnce && this.headers.debug) {
        delete this.headers.debug;
        this.debuggingOnce = false;
      }
    });  
  }

  GET(route, options) {
    const _this = this;
    return new Promise((resolve, reject) => {
      const scope = { method: 'GET', route, data: undefined, options: options||{}, resolve, reject };
      const url = _this.makeUrl(scope);
      this.agent
        .get(url)
        .set({ ..._this.headers, ...scope.options.headers })
        .catch(err => {
          reject(err)
        })
        .then(makeHandler(scope));

      if (this.debuggingOnce && this.headers.debug) {
        delete this.headers.debug;
        this.debuggingOnce = false;
      }
    });  
  }

  DEL(route, data, options) {
    const _this = this;
    return new Promise((resolve, reject) => {
      const scope = { method: 'DELETE', route, data, options: options||{}, resolve, reject };
      const url = _this.makeUrl(scope);
      this.agent
        .delete(url)
        .send(data)
        .set({ ..._this.headers, ...scope.options.headers })
        .catch(err => reject(err))
        .then(makeHandler(scope));

      if (this.debuggingOnce && this.headers.debug) {
        delete this.headers.debug;
        this.debuggingOnce = false;
      }
    });  
  }

  FAIL_POST(route, data, options) {
    return this.POST(route, data, { expectToFail: true, ...options });
  }
  FAIL_PUT(route, data, options) {
    return this.PUT(route, data, { expectToFail: true, ...options });
  }
  FAIL_GET(route, options) {
    return this.GET(route, { expectToFail: true, ...options });
  }
  FAIL_DEL(route, data, options) {
    return this.DEL(route, data, { expectToFail: true, ...options });
  }

  async GET_OR_CREATE_TYPE(typename, fields = []) {
    const [ singular, plural ] = typename.split(/[|:,]/, 2);
    let T = await this.GET(`/type/${singular}`);
    if (T) return T;
    T = await this.POST(`/type/${typename}`);
    for (let field of fields) {
      await this.POST(`/type/${singular}/field/${field.name}`, field);
    }
    T = await this.GET(`/type/${singular}`);
    return T;
  }

  async FORCE_DELETE_TYPE(name) {
    let T = await this.GET(`/types/${name}`);
    if (T) {
      // before deleting a type, all of its entities must be deleted first
      await this.DEL(`/${name}`); // THIS IS EXTREMELY DANGEROUS
      await this.DEL(`/types/${name}`);
    }
  }

  async CLEAN_CREATE_TYPE(typename) {
    const [ singular, plural ] = typename.split(/[|:,]/, 2);
    let T = await this.GET(`/types/${singular}`);
    if (T) {
      // before deleting a type, all of its entities must be deleted first
      await this.DEL(`/${singular}`); // THIS IS EXTREMELY DANGEROUS
      await this.DEL(`/types/${singular}`);
    }
    T = await this.POST(`/types/${singular}`);
    return T;
  }

  async login(email, password) {
    try {
      const auth = await this.POST("/login", { email, password });
      this.auth = auth;
      this.setHeader("session-token", auth.token);
      return auth;
    }
    catch(ex) {
      throw new Error(ex.message);
    }
  }

  async getOrCreateApp(appName) {

    try {

      let appDef = await this.GET(`/application/${appName}`);

      if (!appDef) {
        appDef = await this.POST(`/application/${appName}`);
        expect(appDef).toBeDefined();
      }

      const app = new AppClient(this.agent, appDef.name, appDef._id);
      expect(app).toBeDefined();

      app.user = this.user;
      app.setHeader("session-token", this.auth.token);

      return app;
      
    }
    catch(ex) {
      debugger
    }
  }

  
  async createAppClient(appName) {
    let app = await this.GET(`/applications/${appName}`);
    if (!app) throw new Error(`App does not exist.  Run create-app first.`);
    const appClient = new AppClient(agent, app.name, app._id);
    appClient.setHeader("session-token", this.auth.token);
    return appClient;
  }
}

const platformId = process.env.API_CLI_PLATFORM_ID;
export const platform = new AppClient(agent, 'platform', platformId);
