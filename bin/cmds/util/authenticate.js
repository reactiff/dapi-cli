import { platform } from './api.js';
import store from "./store.js";

function authenticate() {

    return new Promise(async (resolve, reject) => {

        try {

            // AUTHENTICATE EACH TIME

            const email = store.get('uid') || process.env.API_CLI_UID;
            const password = store.get('pwd') || process.env.API_CLI_PWD;

            const { user, token } = await platform.login(email, password);
            store.set('session-token', token);
            store.set('user', user);
            
            resolve({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                roles: user.roles,
                token
            });
        }
        catch(ex) {
            reject(ex);
        }
    });
}

export default authenticate;