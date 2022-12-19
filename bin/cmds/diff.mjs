import _ from 'lodash';
import util, { platform } from "./util/index.js";
import require from "./util/require.js";
const chalk = require("chalk");

export const command = ["diff"];
export const desc = "Compare local type definitions with remote before committing";
export const options = {
    'D': {
        alias: 'debug',
        type: 'boolean',
        default: false,
    },
    'E': {
        alias: 'expand',
        type: 'boolean',
        default: false,
    },
    'C': {
        alias: 'changed',
        type: 'boolean',
        default: false,
    },
    'N': {
        alias: 'new',
        type: 'boolean',
        default: false,
    },
    'R': {
        alias: 'removed',
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

// diff
async function execute(argv, resolve) {
  try {

    await util.authenticate();

    const pkg = util.getLocalPackage();
    const app = await platform.createAppClient(pkg.name);
    if (argv.D || argv.debug) app.setHeader('debug', 'true');
    
    const types = util.getLocalTypes();
    if (!types) throw new Error('no types definitions found');
  
    let payload = {
        types,
    }
    
    const argTypes = argv._.slice(1);
    if (argTypes.length > 0) {
        for (let t of argTypes) assert(types[t], `type '${t}'`);
        payload.types = _.pick(types, argTypes);
    }

    let results = await app.POST(`/meta/diff`, payload);
    

    const showChanged = argv.C || argv.changed;
    const showAdded = argv.A || argv.added;
    const showRemoved = argv.R || argv.removed;
    const isFiltered = showChanged || showAdded || showRemoved;
    if (isFiltered) {
        const changedKeys = showChanged ? Object.keys(results).filter(key => results[key].$status === 'changed') : [];
        const addedKeys = showAdded ? Object.keys(results).filter(key => results[key].$status === 'added') : [];
        const removedKeys = showRemoved ? Object.keys(results).filter(key => results[key].$status === 'removed') : [];
        results = _.pick(results, [ ...changedKeys, ...addedKeys, ...removedKeys ]);
    }

    console.clear();
    if (argv.E || argv.expand) {
        showDetails(results, { pkg });
    }
    else {
        showSummary(results, { pkg });
    }

    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}


// color formatters
const colNeutral = chalk.white;
const colGray = chalk.gray;
const colWhite = chalk.white;
const colAdded = chalk.greenBright;
const colRemoved = chalk.redBright;
const colChanged = chalk.yellowBright;
const colPrevious = chalk.magentaBright;

function getFormatterByStatus(status) {
    return util.inline.switch(
        status, () => colNeutral,
        'added', () => colAdded,
        'changed', () => colChanged,
        'removed', () => colRemoved,
        'previous', () => colPrevious,
        'virtual', () => colGray,
    )
}
function format(status, text) {
    const formatter = getFormatterByStatus(status);
    return formatter(text);
}
function formatTypeName(status, text) {
    const formatter = getFormatterByStatus(status);
    //return formatter.underline(text);
    return formatter.bold(text);
}
function formatVirtual(status, text) {
    const formatter = getFormatterByStatus(status);
    //return formatter.underline(text);
    return formatter.italic(text);
}

///////////////////////////////////////////////////////////////////// SUMMARY


function showSummary(results, scope) {
    console.group('');
    const desc = ' meta diff (summary)';
    const heading = chalk.white.bold(scope.pkg.name) + chalk.gray(desc);
    const text = scope.pkg.name + desc;
    const decoration = new Array(text.length).fill('=').join('');
    console.log(decoration);
    console.log(heading);
    console.log(decoration);
    console.log('');

    // print header
    console.log(
        colGray('Type'.padEnd(32)), 
        colGray('flds'.padStart(10)), 
        colGray('indcs'.padStart(10))
    );

    console.log(
        colGray(new Array(32).fill('-').join('')),
        colGray(new Array(10).fill('-').join('')),
        colGray(new Array(10).fill('-').join('')),
    );

    for (let typeName of Object.keys(results)) {
        const type = results[typeName];
        const typeStatus = format(type.$status, typeName.padEnd(32));
        const fieldStatus = diffSummary(type.$fields);
        const indexStatus = diffSummary(type.$indices);
        console.log(typeStatus, fieldStatus, indexStatus);
    }
    console.groupEnd();
    console.log('');
}

function diffSummary(x) {
    if (!x) return '';
    const s = x.$summary;
    if (!s) return '';
    return [
        colAdded((s.added ? s.added.toString() : '-').padStart(4)),
        colChanged((s.changed ? s.changed.toString() : '-').padStart(3)),
        colRemoved((s.removed ? s.removed.toString() : '-').padStart(3)),
    ].join('');
}


///////////////////////////////////////////////////////////////////// DETAILS

// helpers
function getChangeSymbol(status) {
    return util.inline.switch(
        status, '',
        'added', '+',
        'removed', '-',
        'changed', '~',
        'unchanged', ' ',
    );
}
function printChangedItems(list, formatItem) {
    if (!list || list.length === 0) return;
    for (let item of list) {
        const { $status, ...props } = item;
        // const symbol = getChangeSymbol($status)

        const tokens = formatItem(item);
        let name = tokens; 
        let other = [];
        if (Array.isArray(tokens)) {
            name = tokens[0];
            other = tokens.slice(1);
        }
        
        console.log(
            format($status, `${name}`),
            ...other,
        )
    }
}

function printByStatus(list, status, formatItem) {

    if (!list || list.length === 0) return;
    const symbol = util.inline.switch(
        status, '',
        'added', '+',
        'removed', '-',
        'changed', '~',
        'unchanged', ' ',
    );
    for (let item of list) {
        const tokens = formatItem(item);
        let name = tokens; 
        let other = [];
        if (Array.isArray(tokens)) {
            name = tokens[0];
            other = tokens.slice(1);
        }
        
        console.log(
            format(status, `${symbol} ${name}`),
            ...other,
        )
    }
}

function printByAttribute(type, attr, formatItem) {
    const a = type[`$${attr}`];
    if (!a.$items.length) return;
    console.group('');
    console.log(colGray(attr));
    console.log(colGray(new Array(attr.length).fill('-').join('')));
    printChangedItems(a.$items, formatItem);
    console.groupEnd();
}


//

function showDetails(results, scope) {

    console.group('');
    const desc = ' meta diff (details)';
    const heading = chalk.white.bold(scope.pkg.name) + chalk.gray(desc);
    const text = scope.pkg.name + desc;
    const decoration = new Array(text.length).fill('=').join('');
    console.log(decoration);
    console.log(heading);
    console.log(decoration);
    console.log('');

    let num = 1; 
    for (let typeName of Object.keys(results)) {
        const type = results[typeName];
        
        const annotation = type.$status ? `(${type.$status})` : '';
        console.group(colGray(`${num++}.`), formatTypeName(type.$status, typeName), colGray(annotation));
                
        printFieldsTable(type);
        printFieldsTable(type, true);

        printByAttribute(type, 'props', x => x);
        printByAttribute(type, 'indices', x => x.$key);

        console.groupEnd();
        console.log('');    
    }
    console.groupEnd();
    console.log('');
}

function getVirtualFields(type) {

    const virtualFields = [];
    // display _hidden fields if they are part of an index
    for (let idx of type.$indices.$items) {
        
        for (let f of idx.$value.fields || []) {
            if (f.startsWith('_')) {

                const fields = {};

                if (idx.$key.startsWith('pk_')) {
                    fields.primaryKey = true;
                }
                else if (/\buniq\b/.test(idx.$key)) {
                    fields.uniqueIndex = idx.$key;
                }
                else {
                    fields.index = idx.$key;
                }

                virtualFields.push({
                    $status: 'virtual',
                    $key: f,
                    $value: {
                        name: f,
                        ...fields,
                    }
                });
            }
        }
    }

    return virtualFields;
}

function printFieldsTable(type, onlyPreviousValues) {
    if (!type.$fields.$items.length) return;

    const allItems = [
        ...getVirtualFields(type),
        ...type.$fields.$items,
    ];

    // filter and sort field names
    const fields = toDictionary(allItems, f => f.$key);
    let fieldNames = Object.keys(fields);
    if (onlyPreviousValues) {
        fieldNames = fieldNames.filter(name => fields[name].$status === 'changed');
    }
    if (onlyPreviousValues && fieldNames.length === 0) return;

    console.group(colGray(!onlyPreviousValues ? '' : '(previous values)'));

    // 1. get col defs
    const cols = getFieldCols(allItems);

    // 2. print col headers
    if (!onlyPreviousValues) {
        printColHeaders(cols);
    }
        
    // 3. print rows
    fieldNames.sort();
    for (let name of fieldNames) {
        printFieldValues(fields[name], cols, onlyPreviousValues);
    }
    
    console.groupEnd();
}

function isObject(v) {
    return typeof v === 'object' && !Array.isArray(v);
}

function getFieldCols(fields) {
    // build dictionary of column names for entire set of fields
    const colDefs = { name: { length: 4, values: [] }, type: { length: 4, values: [] } };

    const registerCol = (key, values) => {
        if (!key.startsWith('$') && !Reflect.has(colDefs, key)) {
            colDefs[key] = { length: key.length, values: [] };
        }
        colDefs[key].values.push(...values);
    };

    for (let field of fields) {
        if (field.$status === 'changed') {
            if (field.$value.$subject === 'object') {
                const items = field.$value.$items;
                const d = toDictionary(
                    items, 
                    item => item.$key, 
                    item => {
                        return getPropValues(item.$value);
                    }
                );
                for (let key of Object.keys(d)) {
                    const values = d[key];
                    registerCol(key, values);
                }
            }
        }
        else {
            const keys = Object.keys(field.$value);
            for (let key of keys) {
                const values = getPropValues(field.$value[key]);
                registerCol(key, values);
            }
        }
    }

    // get stats for each column
    for (let key of Object.keys(colDefs)) {
        const col = colDefs[key];
        col.name = key;
        col.length = Math.max(col.length, ...col.values.map(x => (x||'').toString().length));
    }

    const { name, type, ...other } = colDefs;
    const keys = Object.keys(other);
    keys.sort();
    return [
        name,
        type,
        ...keys.map(k => colDefs[k]),
    ]
}

function printColHeaders(cols) {
    const headings = cols.map(c => {
        const caption = c.name === 'name' ? 'field' : c.name;
        return colGray(caption.padEnd(c.length, ' '))
    });
    console.log(...headings);
    const dashes = cols.map(c => colGray(''.padEnd(c.length, '-')));
    console.log(...dashes);
}


function getPropValues(obj) {
    if (isObject(obj) && obj.$subject === 'transition') {
        return [
            obj.$current,
            obj.$previous,
        ];
    }
    return [obj];
}


function getPropValue(obj, previous) {
    if (isObject(obj) && obj.$subject === 'transition') {
        if (previous) return obj.$previous;
        return obj.$current;
    }
    return obj;
}

function getFieldPropValueByKey(field, key) {
    const value = field.$value[key];
    return value;
}

function printFieldValues(field, cols, previousValues) {
    const { $status, ...props } = field;
    let value;
    const values = cols.map(c => {
        switch ( $status ) {
            case 'added':
            case 'removed':
            case 'unchanged':
                value = getFieldPropValueByKey(field, c.name);
                const displayValue = value === null || value === undefined ? '' : value;
                return format($status, displayValue.toString().padEnd(c.length, ' '));
            case 'virtual':
                value = getFieldPropValueByKey(field, c.name);
                return formatVirtual($status, (value||'').toString().padEnd(c.length, ' '));
            default:
                assert($status === 'changed', `$status is 'changed' by default`)
                const changes = field.$value;
                if (changes.$subject === 'object') {
                    const items = changes.$items;
                    const d = toDictionary(items, x => x.$key);
                    const p = d[c.name];
                    const status = !!p ? p.$status : '';
                    value = !!p ? getPropValue(p.$value, previousValues) : '';
                    const color = status === 'changed' && previousValues ? 'previous' : status;
                    if (previousValues && c.name !== 'name' && status !== 'changed') {
                        return ''.toString().padEnd(c.length, ' ');   
                    }
                    return format(color, (value||'').toString().padEnd(c.length, ' '))
                }
                else {
                    debugger;
                }
        }
    });
    console.log(...values);
}