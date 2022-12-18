import util, { platform } from "./util/index.js";
import require from "./util/require.js";
const chalk = require("chalk");
/////////////////////////////////////////// SETUP

export const command = ['set'];
export const desc = '';
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
    
    const args = argv._.slice(1);
    util.store.set(args[0], args[1]);
    
    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }

}
