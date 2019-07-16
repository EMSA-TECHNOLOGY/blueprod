# Web Service implementation by Koa.js

The purpose of this module is to integration of all koa's best middlewares which are ready for production.

Also so to give facilities for dynamic API binding and websocket integration with socket.io.


## How To Use

To do...

```javascript
// this is wrong
app.use(function (ctx, next) {
    ctx.set("Access-Control-Allow-Origin", "*");
    next();
});
// this is right
app.use(async function (ctx, next) {
    ctx.set("Access-Control-Allow-Origin", "*");
    await next();
});
```

### Develop & Register Your Middleware

- Ref: Middleware Best Practices: https://github.com/koajs/koa/blob/master/docs/guide.md#middleware-best-practices


## License

MIT license 

## Author

Developed & maintained by EMSA TECHNOLOGY COMPANY LTD (contact @ emsa-technology dot com).
