import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import util, { platform } from "./util/index.js";
import require from "./util/require.js";
const chalk = require("chalk");

export const command = "export";
export const desc = "Export entity type interfaces";
export const options = {
    debug: {
        alias: 'd',
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

    const argOptions = [ ['types']];
    const args = argv._.slice(1);

    // check that each arg is valid
    for (let i in args) {
      if (Array.isArray(argOptions[i]) && !argOptions[i].includes(args[i])) {
        throw new Error(`Valid options for arg[${i}]: ` + argOptions[i].join('|'));
      }
    }

    await util.authenticate();

    const pkg = util.getLocalPackage();
    const app = await platform.createAppClient(pkg.name);
    
    if (argv.debug) app.setHeader('debug', 'true');
    
    if (args[0] === 'types') {
      const appTypes = await app.GET(`/types`);
      saveTypes(appTypes, argv);
    }   
        
    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}

function getOutputFilePath(filename) {
  const metaPath = util.getLocalTypesPath();
  return path.join(metaPath.path, filename);
}

function saveTypes(types, argv) {
  
  const filename = argv.saveAs || 'entityTypes.ts';
  const outPath = getOutputFilePath(filename);

  const typeNameLiteral = 'export type EntityTypeName = ' + Object.keys(types).map(name => `'${name}'`).join('|') + `;\n`;
  
  const definitions = Object.keys(types)
    .map(key => 
      'export const ' + key + ': IEntityType = ' + JSON.stringify(types[key], null, '\t')
    ).join('\n\n');


  try {
    fs.writeFileSync(outPath, 
      '// Created by DAPI CLI. DO NOT MODIFY MANUALLY!\n\n' +  
      typeNameLiteral +
      declarations + 
      definitions
    );
  } catch (err) {
    console.error(err)
  }
}

const declarations = `
export type Dictionary<T> = { [index: string | number | symbol]: T };
export type FieldDictionary<T> = { [index: string | number | symbol]: T };

export type FieldType =
  | "any"
  | "string"
  | "text"
  | "number"
  | "numeric"
  | "integer"
  | "milliseconds"
  | "boolean"
  | "date"
  | "time"
  | "uuid"
  | "video"
  | "array"
  | "object"
  | "dictionary"
  | "hidden"
  | "phone"
  | "password"
  | "ref"
  | "number"
  | "index";

export interface IFieldDef {
  name: string;
  type: FieldType;
  base?: boolean,
  readonly?: boolean;
  internal?: boolean;
  required?: boolean;
  settable?: boolean;
  primaryKey?: boolean | string;
  index?: boolean | string;
  uniqueIndex?: boolean | string;
  defaultValue?: any;
  options?: any[];
}

export interface IEntityType {
  name: string;
  plural: string;
  fields: FieldDictionary<IFieldDef>;
  display: {
    title: string;
    plural: string;
  };
  indices: Dictionary<any>,
  modules: Dictionary<any>,
  shardKeys: any[],
}`;