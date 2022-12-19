import util, { platform } from "./util/index.js";
import require from "./util/require.js";
const chalk = require("chalk");
/////////////////////////////////////////// SETUP

export const command = ['use'];
export const desc = 'Use local or remote host (local when developing dapi-server)';
export const builder = {};
export const handler = function (argv) {
  return new Promise(async (resolve, reject) => {
    execute(argv, resolve).catch((ex) => {
      console.log(chalk.redBright(ex.message));
    })})};
/////////////////////////////////////////////////

// YOUR IMPLAMENTATION OF EXECUTE
async function execute(argv, resolve) {
  try {
    const pkg = util.getLocalPackage();
  
    const argOptions = [
      ['local', 'remote'],
    ]

    const args = argv._.slice(1);

    // check that each arg is valid
    for (let i in args) {
      if (Array.isArray(argOptions[i]) && !argOptions[i].includes(args[i])) {
        throw new Error(`Valid options for arg[${i}]: ` + argOptions[i].join('|'));
      }
    }

    // Do your thing!

    util.store.set('useLocal', args[0] === 'local');

    
    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }

}
