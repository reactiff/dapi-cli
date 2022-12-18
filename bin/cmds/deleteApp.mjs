import util, { platform } from "./util/index.js";
import require from "./util/require.js";
const chalk = require("chalk");

export const command = ["delete-app"];
export const desc = "delete app";
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

    let app = await platform.GET(`/applications/${pkg.name}`);
    if (!app) throw new Error('failed to get app');
    if (argv.D || argv.debug) app.setHeader('debug', 'true');
    
    console.log(chalk.redBright(`Are you sure you want to PERMANENTLY DELETE app ${app.name}?`));

    const input = await util.userInput(
      chalk.gray(`(type 'Delete  ${app.name}' to confirm)`)
    );
    
    if (input === `Delete ${app.name}`) {

      console.log(chalk.blueBright(`. deleting app ${app.name}...`));
      await platform.DEL(`/applications/${app.name}`);
      app = await platform.GET(`/applications/${app.name}`);
      if (!app) {
        console.log(chalk.greenBright(`. app deleted`));
      } else {
        console.log(chalk.redBright(`. could not delete app`));
      }
    } else {
      console.log(chalk.blueBright(". aborted"));
    }
  
  

    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
