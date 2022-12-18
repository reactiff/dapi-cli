import * as createApp from './createApp.mjs';
import * as deleteApp from './deleteApp.mjs';
import * as status from './status.mjs';
import * as diff from './diff.mjs';
import * as commit from './commit.mjs';
import * as build from './build.mjs';
import * as use from './use.mjs';
import * as set from './set.mjs';
import * as get from './get.mjs';
import * as Export from './export.mjs';

const map = {
    createApp,
    deleteApp,
    status,
    diff,
    commit,
    build,
    use,
    set,
    get,
    Export,
};

export const commands = Object.values(map);
export const keys = Object.keys(map);