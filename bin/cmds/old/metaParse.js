import fs from "fs";
import path from "path";
import interactiveDict from "./interactiveDict.js";
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

async function getDifferences(types, scope) {
  try {
    const { authenticate, store, GET, POST, PUT, DELETE, rethrow } = scope;

    await authenticate(scope).catch(rethrow);

    messageBox("Running diff...");

    const result = await POST("/unit-testing/types/diff", { types }).catch(rethrow);

    messageBox(result);

    return result;

  } catch (ex) {
    messageBox("ERROR: " + ex.message);
  }
}



function build(yargs, scope) {}

function handle(argv, scope) {
  return new Promise(async (resolve, reject) => {
    const { authenticate, store, GET, POST, PUT, DELETE, rethrow } = scope;

    const currentApp = store.get('selected-app');
    if (!currentApp) {
      console.log(
        chalk.redBright('Create and/or select an app first:'),
        chalk.cyanBright('> api app select <name>')
      );
      process.exit();
      return;
    }

    const dir = path.resolve(process.cwd());
    let types = {};
    const files = fs.readdirSync(dir);
    for (let f of files) {
      const tokens = f.split(".");
      if (tokens.length > 1 && /(js|json|jsonc)/.test(tokens[1])) {
        const module = require(dir + "\\" + f);
        if (module.$schema === "_entityType") {
          const { $schema, ...other } = module;
          Object.assign(types, other);
        }
      }
    }

    const diff = await getDifferences(types, scope);

    // get type from the list
    const [name, type] = await interactiveDict.show(types, {
      name: 'type', plural: 'entity types',
      printItem: (key, item, index) => {
        const fields = Object.keys(item);
        fields.sort();
        console.log(
          (index + 1).toString().padStart(4, " ") + '.',
          chalk.cyan(key.padEnd(24, " ")),
          ...fields.map((f) => f.padEnd(16, " "))
        );
      }
    });

    if (name && type) {
      console.log(boxen(`${name} selected`));
    }
            
    resolve();
    process.exit();

  });
}

export default {
  build,
  handle,
};
