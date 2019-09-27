const path = require('path');
/* Set root app path to this test folder */
const rootAppPath = path.join(process.cwd(), 'test');
const assert = require('assert');
const config = require('../lib/BlueProdConfig').load({rootAppPath, debug: true});

describe('blueprod-config-basic', function() {

  describe('#Should load .env correctly', function() {
    it('load TEST environment', function() {
      process.env["NODE_ENV"] = 'test';
      config.reload({rootAppPath, debug: true});
    });

    it('Var envKey1 in .env should NOT return \"test string 1\"', function() {
      assert.strictEqual(config.get('envKey1'), undefined);
    });

    it('Var envTestKey1 in .env.test should return \"test string 2\"', function() {
      assert.strictEqual(config.get('envTestKey1'), 'test string 2');
    });
  });

  /* ENV: TEST */
  describe('#Should load test environment correctly', function() {
    it('load TEST environment', function() {
      process.env["NODE_ENV"] = 'test';
      config.reload({rootAppPath, debug: true});
    });

    /* default.js */
    it('Var defaultJSKey1 in test.js should be loaded.', function() {
      assert.strictEqual(config.get('defaultJSKey1'), 1);
    });

    /* default.json */
    it('Var defaultJsonKey1 in test.js should be loaded.', function() {
      assert.strictEqual(config.get('defaultJsonKey1'), 1);
    });

    /* default.yaml */
    it('Var defaultYamlKey1 in test.js should be loaded.', function() {
      assert.strictEqual(config.get('defaultYamlKey1'), 1);
    });

    /* test.js */
    it('Var testJsKey1 in test.js should be loaded.', function() {
      assert.strictEqual(config.get('testJsKey1'), 1);
    });
    /* test.yaml */
    it('Var testYamlKey1 in test.yaml should be loaded.', function() {
      assert.strictEqual(config.get('testYamlKey1'), 1);
    });
    /* test.json */
    it('Var testJsonKey1 in test.yaml should be loaded.', function() {
      assert.strictEqual(config.get('testJsonKey1'), 1);
    });

    /* test vars should NOT be loaded */
    it('Var developmentJsKey1 in development.js should NOT be loaded.', function() {
      assert.strictEqual(config.get('developmentJsKey1'), undefined);
    });
    it('Var developmentJsonKey1 in development.json should NOT be loaded.', function() {
      assert.strictEqual(config.get('developmentJSKey1'), undefined);
    });
    it('Var developmentYamlKey1 in development.yaml should NOT be loaded.', function() {
      assert.strictEqual(config.get('developmentJSKey1'), undefined);
    });

    it('Var productionJsKey1 in production.js should NOT be loaded.', function() {
      assert.strictEqual(config.get('productionJsKey1'), undefined);
    });
    it('Var productionJsonKey1 in production.json should NOT be loaded.', function() {
      assert.strictEqual(config.get('productionJsonKey1'), undefined);
    });
    it('Var productionYamlKey1 in production.yaml should NOT be loaded.', function() {
      assert.strictEqual(config.get('productionYamlKey1'), undefined);
    });
  });

  /* ENV: DEVELOPMENT */
  describe('#Should load development environment correctly', function() {
    it('load DEVELOPMENT environment', function() {
      process.env["NODE_ENV"] = 'development';
      config.reload({rootAppPath: rootAppPath, debug: true});
    });

    /* default.js */
    it('Var defaultJSKey1 in test.js should be loaded.', function() {
      assert.strictEqual(config.get('defaultJSKey1'), 1);
    });

    /* default.json */
    it('Var defaultJsonKey1 in test.js should be loaded.', function() {
      assert.strictEqual(config.get('defaultJsonKey1'), 1);
    });

    /* default.yaml */
    it('Var defaultYamlKey1 in test.js should be loaded.', function() {
      assert.strictEqual(config.get('defaultYamlKey1'), 1);
    });

    /* development.js */
    it('Var developmentJsKey1 in development.js should be loaded.', function() {
      assert.strictEqual(config.get('developmentJsKey1'), 1);
    });

    /* development.yaml */
    it('Var developmentYamlKey1 in development.yaml should be loaded.', function() {
      assert.strictEqual(config.get('developmentYamlKey1'), 1);
    });

    /* development.json */
    it('Var developmentJsonKey1 in development.yaml should be loaded.', function() {
      assert.strictEqual(config.get('developmentJsonKey1'), 1);
    });

    /* test vars should NOT be loaded */
    it('Var testJsKey1 in test.js should NOT be loaded.', function() {
      assert.strictEqual(config.get('testJsKey1'), undefined);
    });
    it('Var testJsonKey1 in test.json should NOT be loaded.', function() {
      assert.strictEqual(config.get('testJsonKey1'), undefined);
    });
    it('Var testYamlKey1 in test.yaml should NOT be loaded.', function() {
      assert.strictEqual(config.get('testYamlKey1'), undefined);
    });

    it('Var productionJsKey1 in production.js should NOT be loaded.', function() {
      assert.strictEqual(config.get('productionJsKey1'), undefined);
    });
    it('Var productionJsonKey1 in production.json should NOT be loaded.', function() {
      assert.strictEqual(config.get('productionJsonKey1'), undefined);
    });
    it('Var productionYamlKey1 in production.yaml should NOT be loaded.', function() {
      assert.strictEqual(config.get('productionYamlKey1'), undefined);
    });
  });

  describe('#Should load production environment correctly', function() {
    it('load PRODUCTION environment', function() {
      process.env["NODE_ENV"] = 'production';
      config.reload({rootAppPath: rootAppPath, debug: true});
    });

    /* default.js */
    it('Var defaultJSKey1 in test.js should be loaded.', function() {
      assert.strictEqual(config.get('defaultJSKey1'), 1);
    });

    /* default.json */
    it('Var defaultJsonKey1 in test.js should be loaded.', function() {
      assert.strictEqual(config.get('defaultJsonKey1'), 1);
    });

    /* default.yaml */
    it('Var defaultYamlKey1 in test.js should be loaded.', function() {
      assert.strictEqual(config.get('defaultYamlKey1'), 1);
    });

    /* production.js */
    it('Var productionJsKey1 in production.js should be loaded.', function() {
      assert.strictEqual(config.get('productionJsKey1'), 1);
    });

    /* production.yaml */
    it('Var productionYamlKey1 in production.yaml should be loaded.', function() {
      assert.strictEqual(config.get('productionYamlKey1'), 1);
    });

    /* production.json */
    it('Var productionJsonKey1 in production.json should be loaded.', function() {
      assert.strictEqual(config.get('productionJsonKey1'), 1);
    });

    /* test vars should NOT be loaded */
    it('Var testJsKey1 in test.js should NOT be loaded.', function() {
      assert.strictEqual(config.get('testJsKey1'), undefined);
    });
    it('Var testJsonKey1 in test.json should NOT be loaded.', function() {
      assert.strictEqual(config.get('testJsonKey1'), undefined);
    });
    it('Var testYamlKey1 in test.yaml should NOT be loaded.', function() {
      assert.strictEqual(config.get('testYamlKey1'), undefined);
    });

    it('Var developmentJsKey1 in development.js should NOT be loaded.', function() {
      assert.strictEqual(config.get('developmentJsKey1'), undefined);
    });
    it('Var developmentJsonKey1 in development.json should NOT be loaded.', function() {
      assert.strictEqual(config.get('developmentJSKey1'), undefined);
    });
    it('Var developmentYamlKey1 in development.yaml should NOT be loaded.', function() {
      assert.strictEqual(config.get('developmentJSKey1'), undefined);
    });
  });

  /* ENV: PRODUCTION */
});
