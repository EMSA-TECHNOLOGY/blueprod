'use strict';

const utils = require('@blueprod/common').Utils;

// Thanh LE

module.exports = function WsCompress(wsApp) {
  const compressEnabled = utils.parseBoolean(process.env[wsApp.constants.CONFIG_KEYS.HTTP_COMPRESS_ENABLED]);

  if (!compressEnabled) {
    /* IgNored */
  } else {
    const koaApp = wsApp.app;
    const compress = require('koa-compress');
    koaApp.use(compress({
      filter: function (content_type) {
        return /text/i.test(content_type);
      },
      /* Minimum response size in bytes to compress. Default 1024 bytes or 1kb. */
      threshold: 1024,
      flush: require('zlib').Z_SYNC_FLUSH
    }));
  }
};
