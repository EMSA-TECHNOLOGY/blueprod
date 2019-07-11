# blueprod-config

This module allows you to manage your application configurations in popular ways:

- (Recommended) Twelve-Factor App: with one main **.env** and __.env.{{process.NODE_ENV}}__ for example: .env.test, .env.production, .env.development (https://github.com/motdotla/dotenv)
- But, our existing software is often dependent on the two other common formats: json & yaml, so we also support:
    - All file with [*.yaml (.json)] -> will be merged regardless to the duplication.
    - And maybe one of the following (if the file name matches with process.env.NODE_ENV): production.yaml (.json), test.yaml (.json) development.yaml (.json)

## Default App Structure

```
(Example for production)
rootAppPath:
   | config (supported to load recursively)
   |   |- default.yaml
   |   |- default.json
   |   |- production.yaml
   |
   |- .env
   |- .env.production
```

## How To Use

```javascript
const config = require('blueprod-config').load();
let configValue = config.get('app_key1')
```

## Options

You can put these parameters in .env or function arguments.

* CONFIG_DIR_NAME: the config folder name (i.e. config)
* ROOT_CONFIG_PATH: The root application configuration path. If this param is provided then CONFIG_DIR_NAME shall be ignored. 

## Merge Rules

```javascript
({}, { a: 'a' }, { a: 'bb' })         // => { a: "bb" }
({}, { a: 'a'  }, { a: undefined })   // => { a: "a" }
({}, { a: 'a'  }, { a: null })        // => { a: null }
({}, {a:{a:'a'}}, {a:{b:'bb'}})       // => { "a": { "a": "a", "b": "bb" }}
({}, {a:['a']}, {a:['bb']})           // => { "a": [ "bb" ] }

a={a:'a'}; merge(a, {b:'bb'});        // a => { a: "a", b: "bb" }
([], ['a'], ['bb'])                   // => [ "bb" ]
([], ['a','b'], ['bb'])               // => [ "bb", "b" ]
```
