import path from 'path';
import fs from 'fs';

function getLocalTypesPath() {

    const cwd = path.resolve(process.cwd());

    const paths = [ cwd + '\\meta\\', cwd + '\\' ];
    const prefixes = ['.','_'];
    const names = ['types','meta.config','meta.types','meta', 'config'];
    const extensions = ['.js','.ts','.mjs', '.cjs', '.json', '.jsonc'];

    const variants = [];
    for (let prefix of prefixes) {
        for (let p of paths) {
            for (let n of names) {
                for (let ext of extensions) {
                    const filename = prefix + n + ext;
                    variants.push({ path: p, filename });
                }
            }    
        }
    }

    for (let v of variants) {
        if (fs.existsSync(v.path + v.filename)) {
            return v;
        }
    }
}

export default getLocalTypesPath;