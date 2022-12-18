import util, { platform } from "./util/index.js";
import require from "./util/require.js";
const chalk = require("chalk");
/////////////////////////////////////////// SETUP

const COMMAND_NAME = 'foo';
const COMMAND_DESC = '';

export const command = [COMMAND_NAME];
export const desc = COMMAND_DESC;
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

    const identity = await util.authenticate();
    const pkg = util.getLocalPackage();
    

    debugger

    // SOME SAMPLE CODE TO GET YUOU STARTED

    // get app
    const app = await platform.GET(`/applications/${pkg.name}`);

    // get server info
    const info = await platform.GET(`/info`);
    
    // view locally defined Entity Types
    const types = util.getLocalTypes();

    if (types) {
      // show meta summary
      console.log("meta:\t", chalk.gray(`${Object.keys(types).length} types`));
    }
    
    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
