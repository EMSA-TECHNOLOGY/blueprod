const path = require('path');
const MVCLoader = require('../src/MVCLoader');

const mvcLoader = new MVCLoader();

const testApiPath = path.join(__dirname);
console.log('Test api path: ' +testApiPath);

(async () => {
  const mvcModel = await mvcLoader.load(testApiPath);
  /* This output should contain the right defined controllers/routes */
  mvcLoader.logger.info(mvcModel);
})()
