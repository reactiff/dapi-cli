import interactiveDict from "./interactiveDict.js";
import toDictionary from "./toDictionary.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const chalk = require("chalk");
const boxen = require("boxen");
const prompt = require('prompt');

// CMD: LISTAPPS

const messageBox = (text, options) => {
  console.log(
    boxen(`${text}`, {
      padding: 1,
      ...options,
    })
  );
}


function build(yargs, scope) {}
function handle(argv, scope) {
  return new Promise(async (resolve, reject) => {
    const { authenticate, store, GET, POST, PUT, DELETE, rethrow } = scope;

    const selectedApp = store.get('selected-app');

    if (selectedApp) {
      messageBox(`${selectedApp.name}`, { backgroundColor: '#003300', borderColor: "#003300" });
    }
    

    try {
      await authenticate(scope).catch(rethrow);

      const appList = await GET("/applications").catch(rethrow);
      const apps = toDictionary(appList, x => x.name);
      
      // get type from the list
      const [name, app] = await interactiveDict.show(apps, {
        name: "app",
        plural: "applications",
        printItem: (key, item, index) => {
          console.log(
            (index + 1).toString().padStart(4, " ") + '.',
            chalk.cyan(key.padEnd(24, " ")),
          );
        },
      });

      if (name && app) {
        store.set('selected-app', app);
      }

      resolve();
      process.exit();
    } catch (ex) {
      scope.messageBox("ERROR", ex.message);
    }
  });
}

export default {
  build,
  handle,
};
