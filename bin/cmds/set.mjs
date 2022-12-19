import util, { platform } from "./util/index.js";
import require from "./util/require.js";
const chalk = require("chalk");
/////////////////////////////////////////// SETUP

export const command = ['set <key> <value>'];
export const desc = 'Set configuration variable';
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
    util.store.set(argv.key, argv.value);
    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }

}
