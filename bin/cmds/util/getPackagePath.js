import path from 'path';
import fs from 'fs';
import { createRequire } from "module";

const require = createRequire(import.meta.url);

function getPackagePath() {
    const cwd = path.resolve(process.cwd());
    const tokens = cwd.split('\\');
    let pkg;
    let j = tokens.length;
    while (j--) {
        const dir = tokens.slice(0, j + 1);
        const filePath = path.join(dir.join('\\'), 'package.json');
        if (fs.existsSync(filePath)) {
            return dir.join('\\');
        }
    }
}

export default getPackagePath;