ws-view-koa-ejs
================

Koa ejs view render middleware. support all feature of [ejs](https://github.com/mde/ejs).

(Ref: https://github.com/koajs/ejs)

## Usage

### Example

```js
const Koa = require('koa');
const render = require('@blueprod/ws-view-koa-ejs');
const path = require('path');

const app = new Koa();
render(app, {
  root: path.join(__dirname, 'view'),
  layout: 'template',
  viewExt: 'html',
  cache: false,
  debug: true
});

app.use(async function (ctx) {
  await ctx.render('user');
});

app.listen(2104);
```

Or you can checkout the [example](https://github.com/koajs/ejs/tree/master/example).

### settings

* root: view root directory.
* layout: global layout file, default is `layout`, set `false` to disable layout.
* viewExt: view file extension (default `html`).
* cache: cache compiled templates (default `true`).
* debug: debug flag (default `false`).
* delimiter: character to use with angle brackets for open / close (default `%`).

### Layouts

`koa-ejs` supports layouts. The default layout file is `layout`. If you want to change default layout file, use `settings.layout`. Also you can specify layout by `options.layout` in `await ctx.render`.
Also you can set `layout = false` to disable the layout.

```
<html>
  <head>
    <title>koa ejs</title>
  </head>
  <body>
    <h3>koa ejs</h3>
    <%- body %>
  </body>
</html>
```

### Include

Supports ejs includes.

```
<div>
  <% include user.html %>
</div>
```

### State

Support [`ctx.state` in koa](https://github.com/koajs/koa/blob/master/docs/api/context.md#ctxstate).

## License

MIT license 

## Author

Developed & maintained by EMSA TECHNOLOGY COMPANY LTD (contact @ emsa-technology dot com).
