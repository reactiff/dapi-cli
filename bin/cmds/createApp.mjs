import util, { platform } from "./util/index.js";
import require from "./util/require.js";
const chalk = require("chalk");

export const command = ["create-app"];
export const desc = "Create new application";
export const options = {
  'D': {
      alias: 'debug',
      type: 'boolean',
      default: false,
  },
};
export const builder = {};
export const handler = function (argv) {
  return new Promise(async (resolve, reject) => {
    execute(argv, resolve).catch((ex) => {
      console.log(chalk.redBright(ex.message));
    });
  });
};

// create-app
async function execute(argv, resolve) {
  try {

    debugger
    
    await util.authenticate();

    const pkg = util.getLocalPackage();

    let app = await platform.GET(`/applications/${pkg.name}`);
    if (app) throw new Error('App already exists');
    if (argv.D || argv.debug) platform.setHeader('debug', 'true');
    
    console.log(chalk.yellowBright(`Create app ${pkg.name}?`));

    const input = await util.userInput(
      chalk.gray(`(type Yes to confirm)`)
    );
    
    if (input === "Yes") {
      console.log(chalk.blueBright(`. creating app ${pkg.name}...`));
      await platform.POST(`/applications/${pkg.name}`);
      app = await platform.GET(`/applications/${pkg.name}`);
      if (app) {
        console.log(chalk.greenBright(`. ok`));
      } else {
        console.log(chalk.redBright(`. failed`));
      }
    } else {
      console.log(chalk.blueBright(". aborted"));
    }
  
  

    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
