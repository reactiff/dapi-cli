# CLI: meta
Command line utility for managing META apps.

## DEV mode
To use it in command line while in dev mode, install like this:
```bash
npm i -g
```

To uninstall (run exactly as shown):
```bash
npm uninstall -g app-cli
```

>Be sure to uninstall it first before renaming it or moving to another folder.

## Commands

(META-CLI will look for package.json)

```js
meta status
```

```bash
# log in to platform
meta login userid password

# change password
meta -chpwd userid password newpassword newpassword

# view identity
meta whoami
```

## EntityTypes
On start up, it will look for EntityType definitions file:

```js
/app/root/[prefix]<name><ext>
```

where each path component can be one of the following options:

|token|options|
|-|:-|
|prefix|. \| _|
|name| types \| meta.config \| meta.types \| meta \| config|
|ext|.js .ts .mjs .cjs .json .jsonc|

NOTE: \<required> [optional]


## Commands
```js
meta create-app <app-name>

meta compare [type]

meta commit [type]
```


## Project setup notes

- To debug locally, run it inside integrated JavaScript debug terminal
- /cmds/status.mjs is the default command

## package.json

When the CLI gets installed, it is registered under an alias, **meta** in this case, which is specified in package.json under "bin": 
```json
{
  ...

  "bin": {
    "meta": "./bin/index.js"   <-- here
  },

  ... 
}

```

---

For more info see the original blog post:

https://developer.okta.com/blog/2019/06/18/command-line-app-with-nodejs




<style>
html, body {
    margin: 0;
    padding: 3vw;
}

p, code, td, th, li { font-size: smaller; line-height: 1.4;  }

h2 {
    margin-top: 5vw;
}
table {
    
    width: 100%;
}
th:first-of-type,
td:first-of-type  { 
    width: 1%;
    min-width: unset;
}
th, td { 
    width: 99%;
}
th {
    
    font-weight: bold;
}
td {
    vertical-align: top;
}
</style>