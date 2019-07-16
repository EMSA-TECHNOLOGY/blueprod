const DEFAULT_MIDDLEWARES = [
  'ErrorResponseHandlerMiddleware',
  'xResponseTime',
  'StaticFileServing',
  'SecurityHeadersMiddleware.js',
  'CorsMiddleware',
  'BodyParser',
  'RequestLogger',
  'RequestDetailedLogger',
  'SessionMiddleware',
  'AuthenticationMiddleware',
  /* Still facing with problem of supporting of ejs include/partial */
  /* And this one is more compatible with express */
  // 'ViewMiddleware',
  'CompressMiddleware',
  'ViewEjsMiddleware',
];

module.exports = {
  DEFAULT_MIDDLEWARES:                  DEFAULT_MIDDLEWARES,
};
