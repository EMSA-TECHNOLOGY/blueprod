'use strict';

const debug = require('debug')('ws:session');
const crypto = require('crypto');

const SESSION_STORE_ADAPTERS = {
  'cookie': 'cookie',
  'redis': '@blueprod/ws-session-redis',
  'mongo': '@blueprod/ws-session-mongo',
  'dynamo': '@blueprod/ws-session-dynamo',
  'mysql': '@blueprod/ws-session-mysql',
  'memcached': '@blueprod/ws-session-memcached',
};

const SESSION_KEY_DEFAULT = 'id';

function generateSessionId() {
  const sha = crypto.createHash('sha256');
  sha.update(Math.random().toString());
  return sha.digest('hex');
}

module.exports = function WsSession(wsApp, opts = {}) {
  const config = wsApp.config;
  if (config.get('http.session.enabled', true) === false) {
    /* Ingored */
  } else {

    const koaApp = wsApp.app;
    const session = require('koa-session');
    /* Rotating keys (keygrid) */
    koaApp.keys = opts.keys || ['7c64ac48-8f3d-11e8-a9ce-ff962942b8f3'];
    /* The key name shall be used to store the session id in the client side */
    koaApp.sessionIdName = process.env['HTTP_SESSION_KEY'] || config.get('http.session.key', SESSION_KEY_DEFAULT);
    /* Default: 12h */
    let maxAge = config.get('http.session.maxAge', 12 * 60 * 60 * 1000);
    //TODO test 30 seconds
    // let maxAge = 30 * 1000;

    const sessionConfig = {
      key: koaApp.sessionIdName, /** (string) cookie key (default is koa:sess) */
      /** (number || 'session') maxAge in ms (default is 1 days) */
      /** 'session' will result in a cookie that expires when session/browser is closed */
      /** Warning: If a session cookie is stolen, this cookie will never expire */
      //TODO TO BE CONFIGURABLE.
      maxAge: maxAge,
      overwrite: true,
      /** (boolean) can overwrite or not (default true) */
      /* The “HttpOnly” cookie attribute instructs web browsers not to allow scripts (e.g. JavaScript or VBscript) an
      ability to access the cookies via the DOM document.cookie object. This session ID protection is mandatory to
      prevent session ID stealing through XSS attacks. */
      /** (boolean) httpOnly or not (default true) */
      httpOnly: true,
      /** (boolean) signed or not (default true) */
      signed: true,
      /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the
       * original maxAge, resetting the expiration countdown. (default is false) */
      rolling: false,
      /** (boolean) renew session when session is nearly expired, so we can always keep user logged in.
       * (default is false)*/
      renew: false,

      genid: generateSessionId
      // store: SessionStore,
      /* Use options.encode and options.decode to customize your own encode/decode methods. */
      // encode: () => {
      //
      // }
      // decode: () => {
      //
      // }
  };

    let sessionStoreAdapter = config.get('http.session.adapter', 'cookie');
    // const moduleName = SESSION_STORE_ADAPTERS[sessionStoreAdapter];

    if (sessionStoreAdapter === 'redis') {
      /* If enable this, koaApp.createContext will return a context (ctx) with session is UNDEFINED!!! */
      // const SessionStoreImpl = require(moduleName);
      // sessionConfig.store = new SessionStoreImpl();
    } else if (sessionStoreAdapter === 'cookie') {
      /* Do nothing since cookie is internally supported */
    } else {
      debug(`Wrong configured session store adapter, using cookie!`);
    }

    koaApp.use(session(sessionConfig, koaApp));
    koaApp.use(require('./SessionHitCount'));

    koaApp.on('session:missed', (p1) => {
      debug('session:missed');
    });

    koaApp.on('session:invalid', (p1) => {
      debug('session:invalid');
    });

    koaApp.on('session:expired', (p1) => {
      debug('session:expired');
    });
  }
};
/*

Events

koa-session will emit event on app when session expired or invalid:

    session:missed: can't get session value from external store.
    session:invalid: session value is invalid.
    session:expired: session value is expired.

Session#isNew

Returns true if the session is new.

if (this.session.isNew) {
  // user has not logged in
} else {
  // user has already logged in
}
 */