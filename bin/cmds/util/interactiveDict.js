import { createRequire } from "module";
const require = createRequire(import.meta.url);
const chalk = require("chalk");
const boxen = require("boxen");
const prompt = require('prompt');

function getUserSelection(options) {
  return new Promise((resolve, reject) => {
    prompt.start();
    prompt.get(
      [
        {
          name: options.name,
          description: "To select, enter Number or first few Letters.  (ENTER to exit)",
          type: "any",
          required: true,
        },
      ],
      function (err, result) {
        if (!!result[options.name]) {
          console.log(`>> YOU ENTERED >> ${result[options.name]}`);
          resolve(result[options.name]);
          return;
        }
        resolve();
      }
    );
  });
}

function show(items, options) {
  return new Promise(async (resolve, reject) => {
    let dict = { ...items };

    let selection;

    while (Object.keys(dict).length > 0 && !selection) {
      let entries = Object.entries(dict);

      // BANNER
      console.log(boxen(`${Object.keys(dict).length} ${options.plural}`));
      let index = 0;
      for (let e of entries) {
        options.printItem(e[0], e[1], index);
        index++;
      }

      console.log('');

      selection = await getUserSelection(options);

      if (!selection) {
        resolve([])
      }

      let matched = {};
      
      // if by number
      if (Number.isInteger(+selection)) {
        
        const index = +selection - 1;

        if (index < Object.keys(dict).length && index >= 0) {
          const key = Object.keys(dict)[index];
          const T = Object.values(dict)[index];
          matched = {
            [key]: T,
          };
        }

      } else {
        // by string
        for (let key of Object.keys(dict)) {
          if (key.startsWith(selection)) {
            matched[key] = dict[key];
          }
        }
      }
      dict = { ...matched };
    }

    const keys = Object.keys(dict);
    const key = keys[0];

    resolve([key, dict[key]]);
  });
}

export default {
  show,
};
