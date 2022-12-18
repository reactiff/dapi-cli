import { createRequire } from "module";
const require = createRequire(import.meta.url);

const chalk = require("chalk");
const boxen = require("boxen");
const prompt = require('prompt');


// STATUS

function build(yargs, scope) { 
    // none
}

function handle(argv, scope) {
    return new Promise(async (resolve, reject) => {

        const { authenticate, store, GET, POST, PUT, DELETE, rethrow } = scope;

        try {
            await authenticate(scope).catch(rethrow);

            const token = store.get('session-token');
            const user = store.get('user');

            const app = store.get('selected-app');

            const padding = 24;

            scope.messageBox(
                'STATUS', [
                    `token`.padEnd(padding, ' ') + ': ' + `${token}`,
                    `user`.padEnd(padding, ' ') + ': ' + `${user.email}`,
                    '',
                    ...(
                        app ? [
                            `app context`.padEnd(padding, ' ') + ': ' + `${app.name}`,
                            `app _id`.padEnd(padding, ' ') + ': ' + `${app._id}`,
                        ] : [
                            `app context`.padEnd(padding, ' ') + ': ' + `(not selected)`,
                        ]
                    )
                ].join('\n')
            );

            scope.messageBox(
                'commands', [
                    'api status',
                    'api list apps',
                ].join('\n')
            );
            resolve();
            process.exit();
        }
        catch(ex) {
            
            scope.messageBox('ERROR', ex.message);
        }
    });
}

export default {
    build,
    handle,
}