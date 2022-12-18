import util, { platform } from "./util/index.js";
import require from "./util/require.js";

import { keys as commandKeys } from './index.mjs';

const chalk = require("chalk");

export const command = ["status", "$0"];
export const desc = "Get status";
export const builder = {};
export const handler = function (argv) {
  return new Promise(async (resolve, reject) => {
    execute(argv, resolve).catch((ex) => {
      console.log(chalk.redBright(ex.message));
    });
  });
};

// STATUS
async function execute(argv, resolve) {
  try {
    
    // make sure there is no command mismatch
    if (argv._.length > 0 && !commandKeys.includes(argv._[0])) {
      console.log(chalk.redBright('Invalid command: ' + argv._[0]));
      console.group('valid commands:');
      commandKeys.forEach(key => {
        console.log(key);
      })
      console.log('');
      console.groupEnd();
      return;
    }
        
    const identity = await util.authenticate();
   
    const pkg = util.getLocalPackage();
    const app = await platform.GET(`/applications/${pkg.name}`);
    console.group('PACKAGE');
    if (app) {
      console.log("name:\t", chalk.greenBright(app.name), `( appId: ${chalk.gray(app._id)} )`);
    } else {
      console.log("name:\t", chalk.white(pkg.name), `( app does not exist )`);
    }
    console.log('');
    console.groupEnd();
    
    const types = util.getLocalTypes();
    if (types) {
      // show meta summary
      console.log("meta:\t", chalk.gray(`${Object.keys(types).length} types`));
    }

    // show identity
    console.log("user:\t", identity.email);
    console.log("");


    const info = await platform.GET(`/info`);
    console.group('SERVER INFO');
    console.log('host:', platform.getHostUrl());
    console.log(info);
    console.log('');
    console.groupEnd();


    
    const settings = util.store.all;
    const settingKeys = Object.keys(settings);
    if (settingKeys.length) {
      console.group('\nSETTINGS');
      settingKeys.forEach(key => {
      
        const value = settings[key];

        if (typeof value === 'object') {
          console.log(chalk.gray(key) + ':', chalk.white('[object]'))
        }
        else {
          console.log(chalk.gray(key) + ':', chalk.white(value))
        }
      
      });
      console.log('');
      console.groupEnd();
    }
    

    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
