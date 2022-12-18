import util, { platform } from "./util/index.js";
import require from "./util/require.js";
import _ from 'lodash';
const chalk = require("chalk");
/////////////////////////////////////////// SETUP

export const command = ['get'];
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

    const selector = args[0];
    const value = _.get(util.store.all, selector);

    console.log(value);
    
    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }

}
