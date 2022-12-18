import Configstore from "configstore";
const store = new Configstore('meta-cli', {});



// const extendedStore = {
//     ...store,

//     // set(key, value) {
//     //     const settings = store.get('_all_') || {};
//     //     settings[key] = value;
//     //     store.set('_all_', settings);
//     //     store.set(key, value);
//     // },

//     // getAllSettings() {
//     //     return store.get('_all_') || {};
//     // }
// }

export default store;