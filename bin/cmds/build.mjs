import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import util, { platform } from "./util/index.js";
import require from "./util/require.js";
const chalk = require("chalk");

export const command = ["build"];
export const desc = "Build types";
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

const { assert, toDictionary } = util;

// builid
async function execute(argv, resolve) {
  try {

    await util.authenticate();

    debugger
    
    const pkg = util.getLocalPackage();
    const app = await platform.createAppClient(pkg.name);
    
    if (argv.D || argv.debug) app.setHeader('debug', 'true');
      
    const appTypes = await app.GET(`/types`);
   
    console.clear();
    
    saveTypeDeclarations(appTypes);
        
    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}


function getOutputFilePath(filename) {
  const rootPath = util.getPackagePath();
  let outputPath;
  const variants = [
    path.join(rootPath, 'workspaces', 'api')
  ];
  for (let p of variants) {
    if (fs.existsSync(p)) {
      return path.join(p, filename);
    }
  }
}


//'string'|'text'|'number'|'numeric'|'integer'|'milliseconds'|'boolean'|'date'|'time'|'uuid'|'video'|'array'|'object'|'dictionary'|'phone'|'password'|'ref'|'number'|'index';

function mapDataType(metaType) {
  switch (metaType) {
    case 'ref':
    case 'text':
    case 'uuid':
    case 'video':  
    case 'phone':  
      return 'string';
    case 'number':
    case 'numeric':
    case 'integer':
    case 'milliseconds':
      return 'number'
    case 'date':
    case 'time':
      return 'object';
    case 'index':  
      return 'boolean|string';
    default:
      return metaType;
  }
}

function saveTypeDeclarations(types) {
    
  debugger
  
  const outPath = getOutputFilePath('meta.interfaces.d.ts');

    // const ltp = util.getLocalTypesPath();
    // if (!ltp) throw new Error('no type definitions found');

    const parts = Object.keys(types).map(key => {
      const type = types[key];
      const name = type.name.startsWith('_') ? type.name.slice(1) : type.name;
      const lines = [
        `export interface I${name[0].toUpperCase()}${name.slice(1)} {`,
        ...Object.values(type.fields).map(f => {
          const isOptional = !f.required;
          const qm = isOptional ? '?' : '';
          const tsType = mapDataType(f.type);
          return `\t${f.name}${qm}: ${tsType}`;
        }),
        `}\n`,
      ];
      return lines.join('\n');
    }) 
    
    

    try {
      fs.writeFileSync(outPath, parts.join('\n'));
    } catch (err) {
      console.error(err)
    }
}

// color formatters
// const colNeutral = chalk.white;
// const colGray = chalk.gray;
// const colWhite = chalk.white;
// const colAdded = chalk.greenBright;
// const colRemoved = chalk.redBright;
// const colChanged = chalk.yellowBright;
// const colPrevious = chalk.magentaBright;
