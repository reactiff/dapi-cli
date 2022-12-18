import { createRequire } from "module";
import path from "path";
import getLocalTypesPath from './getLocalTypesPath.js';
const require = createRequire(import.meta.url);

function getLocalTypes() {
    const ltp = getLocalTypesPath();
    const filePath = path.join(ltp.path, ltp.filename);
    let types = require(filePath);
    const transformed = transformTypes(types);
    return transformed;
}

function transformTypes(types) {
    const results = {};
    const keys= Object.keys(types).filter(k => !k.startsWith('$$'))
    for (let typeKey of keys) {
        const type = types[typeKey];
        results[typeKey] = {
            name: typeKey,
            fields: Object.keys(type.fields).map(fieldKey => {
                return {
                    name: fieldKey,
                    ...type.fields[fieldKey],
                };
            }),
        }
    }
    return results;
}

export default getLocalTypes;