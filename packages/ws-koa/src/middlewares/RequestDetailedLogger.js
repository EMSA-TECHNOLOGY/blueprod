'use strict';

const utils = require('@blueprod/common').Utils;

// Thanh LE

// An utility middleware to trace detailed //

/* Sample

General:
========
Request URL: https://www.segger.com/langHeader.php
Request Method: GET
Status Code: 200 OK (from disk cache)
Remote Address: 78.31.67.95:443
Referrer Policy: no-referrer-when-downgrade

Response Headers
===============
Accept-Ranges: none
Cache-Control: max-age=900, private, must-revalidate
Content-Length: 2
Content-Type: text/html; charset=UTF-8
Date: Wed, 16 May 2018 14:59:36 GMT
Expires: Wed, 16 May 2018 14:59:36 GMT
Server: Apache/2.4.18 (Ubuntu)
X-Content-Type-Options: nosniff
X-UA-Compatible: IE=edge
Provisional headers are shown

Request Headers
===============
Accept:
Referer: https://www.segger.com/
  User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36
X-Requested-With: XMLHttpRequest

 */

module.exports = function WsRequestDetailedLogger(wsApp) {
  const traceReq = utils.parseBoolean(process.env[wsApp.constants.CONFIG_KEYS.HTTP_TRACE_REQUEST_ENABLED]);
  const traceReqDetails = utils.parseBoolean(process.env[wsApp.constants.CONFIG_KEYS.HTTP_TRACE_REQUEST_DETAIL_ENABLED]);
  const printPretty = utils.parseBoolean(process.env[wsApp.constants.CONFIG_KEYS.HTTP_TRACE_REQUEST_PRETTY]);

  async function RequestDetailedLogger(ctx, next) {
    const reqDetail = {
      url: ctx.url,
      isSocket: !!ctx.isSocket,
      ip: ctx.ip,
      query: ctx.query || {},
      params: ctx.params || {},
      headers: ctx.request.headers,
      body: ctx.body || {},
      options: ctx.options || {},
    };

    if (printPretty) {
      logger.debug(JSON.stringify(reqDetail, null, 2));
    } else {
      logger.debug(JSON.stringify(reqDetail));
    }

    await next();
  }

  if (traceReq && traceReqDetails) {
    wsApp.app.use(RequestDetailedLogger)
  }
};
