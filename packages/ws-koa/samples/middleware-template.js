/**
 * This section covers middleware authoring best practices, such as middleware accepting options, named middleware for debugging, among others.
 *
 * Middleware Options: When creating public middleware it's useful to conform to the convention of wrapping the middleware in a function that accepts options, allowing users to extend functionality. Even if your middleware accepts no options, this is still a good idea to keep things uniform.
 *
 * Here our contrived logger middleware accepts a format string for customization, and returns the middleware itself:
 *
 * Naming middleware is optional, however it's useful for debugging purposes to assign a name.
 *
 * @param format
 * @returns {Function}
 */
function logger(format) {
  format = format || ':method ":url"';

  return async function (ctx, next) {
    const str = format
      .replace(':method', ctx.method)
      .replace(':url', ctx.url);

    console.log(str);

    await next();
  };
}

app.use(logger());
app.use(logger(':method :url'));
