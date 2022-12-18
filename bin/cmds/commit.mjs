import _ from 'lodash';
import util, { platform } from "./util/index.js";
import require from "./util/require.js";

const chalk = require("chalk");

export const command = ["commit"];
export const desc = "commit meta";
export const options = {
    'D': {
        alias: 'debug',
        type: 'boolean',
        default: false,
    },
    'F': {
        alias: 'force',
        type: 'boolean',
        default: false,
    }
};
export const builder = {};
export const handler = function (argv) {
  return new Promise(async (resolve, reject) => {
    execute(argv, resolve).catch((ex) => {
      console.log(chalk.redBright(ex.message));
    });
  });
};

const { assert } = util;

// commit
async function execute(argv, resolve) {
  try {

    debugger

    await util.authenticate();

    const pkg = util.getLocalPackage();
    const app = await platform.createAppClient(pkg.name);
    if (argv.D || argv.debug) app.setHeader('debug', 'true');

    const types = util.getLocalTypes();
    assert(types, 'types.js');
    
    let payload = {
        force: argv.F || argv.force,
        types,
    }

    const argTypes = argv._.slice(1);
    if (argTypes.length > 0) {
        for (let t of argTypes) assert(types[t], `type '${t}'`);
        payload.types = _.pick(types, argTypes);
    }

    const results = await app.POST(`/meta/commit`, payload);

    for (let r of results) {
        console.log(r);    
    }

    

    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}

