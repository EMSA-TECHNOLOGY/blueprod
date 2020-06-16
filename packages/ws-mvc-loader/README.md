# ws-mvc-loader

An utility module that supports to load the API definition is various structure and formats:

Your api structure should be (you could customize):

```
* api
   |--- config              -> containing the definition for the API routes
           |--- routes.js
           |--- routes.json 
   |--- controllers         -> containing the api handlers for defined routes
   |--- services            -> containing the business services for handling of the business logic
  
```

Notes:

* Route files should be provided as glob pattern, for example, user-routes.js

## Example of a Route file

```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/products",
      "handler": "product.list",
      "config": {
        "auth": false
      }
    },
    {
      "method": "GET",
      "path": "/products/count",
      "handler": "product.count",
      "config": {
        "auth": false
      }
    }
  ]
}
```



