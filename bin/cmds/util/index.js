import { platform } from './api.js';
import authenticate from './authenticate.js';
import getPackagePath from './getPackagePath.js';
import getLocalPackage from './getLocalPackage.js';
import getLocalTypesPath from './getLocalTypesPath.js';
import getLocalTypes from './getLocalTypes.js';
import interactiveDict from "./interactiveDict.js";
import messageBox from "./messageBox.js";
import rethrow from "./rethrow.js";
import store from "./store.js";
import toDictionary from "./toDictionary.js";
import userInput from "./userInput.js";
import inline from "./inline.js";
import * as assert from "./assert.js";

export { platform } from './api.js';
export {default as authenticate } from './authenticate.js';
export {default as getPackagePath } from './getPackagePath.js';
export {default as getLocalPackage } from './getLocalPackage.js';
export {default as getLocalTypes } from './getLocalTypes.js';
export {default as getLocalTypesPath } from './getLocalTypesPath.js';
export {default as interactiveDict } from './interactiveDict.js';
export {default as messageBox } from './messageBox.js';
export {default as rethrow } from './rethrow.js';
export {default as store } from './store.js';
export {default as toDictionary } from './toDictionary.js';
export {default as userInput } from './userInput.js';
export {default as inline } from './inline.js';

export { assert } from './assert.js';

export default {
    ...assert,
    platform,
    authenticate,
    getPackagePath,
    getLocalPackage,
    getLocalTypes,
    getLocalTypesPath,
    interactiveDict,
    messageBox,
    rethrow,
    store,
    toDictionary,
    userInput,
    inline,
}