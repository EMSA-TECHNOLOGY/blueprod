# Development Roadmap

The purpose of this doc is to document important implementation and future release.

## Reference

- Koa 3.0 Roadmap: https://github.com/koajs/koa/issues/1114
- Koa Guide: https://github.com/koajs/koa/blob/master/docs/guide.md
- Koa 3.0 changes
   - don't set header when `respond=false` and header sent #1044
   - req.origin should display the `origin` header if it exists, not the current hostname #1008
   - Empty response if result is null #998
   - Drop special 'back' case from response.redirect? #904    
   