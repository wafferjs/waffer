# Waffer
Waffer is a pre-designed MVC server

## Install
There is a repo for cli [wafferjs/waffer-cli](https://github.com/wafferjs/waffer-cli)

```sh
$ npm install -g waffer-cli
```

## Usage
See [waffer-cli usage](https://github.com/wafferjs/waffer-cli#Usage)

## Features

### Vue frontend
By default [Vue.js](https://vuejs.org/) and [vue-router](https://router.vuejs.org/) are used for rendering the website.

#### Custom components
Custom components are shared between views. Base project ships with two custom components which are used in every view to handle errors: `error-handler` and `error`

Easiest way to create components in waffer is to run `waffer component <name>` in directory of the project.

Note that to append custom components to your view you have to add proper tags to your pug template
```pug
html
  head
    link(href='/components.css', rel='stylesheet')
    // ...

  body
    // ...
    script(src='/components.js')

```

### View files linking
By default all assets are taken from the `assets/static/` directory of your project.

Every url that starts with `@` represents a file from current view &mdash; i.e.
```sh
# request scripts/app.js of the current view
http://example.com/@scripts/app.js # `/` is equal to `/index/` view
http://example.com/my-view/@scripts/app.js
```

To access another files of another view you can request them from `/view-name/file`. If requested file is not found it will be redirected to `assets/static/` + `view-name/file` of the root of your project.

### Two routers
There are two routers one on the server side and one on the client side

```
https://example.com/main-view/sub-view/
```

#### Server side router
Server side router handles main views &mdash; i.e.
```sh
https://example.com/users/
https://example.com/posts/
```

These routes are defined by your view structure in the `views/` directory of your project. The easiest way to create a new view is to run `waffer view <name>` inside your project directory.

Server side views can be totally different from each other. You can serve single `index.pug` file or a full blown view with client routing from the template.

#### Client side router
Client side router handles all sub-views &mdash; i.e.
```sh
https://example.com/users/wvffle/
https://example.com/posts/123/
```

To define a route you have to add an entry to `@scripts/routes.js` with subview url as a key and a template file as a value
```js
export default {
  '/users': 'templates/users',
  // ...
}
```

You can also name the routes by passing an array with the template as the first element and name of the route as the second one
```js
export default {
  // ...

  // add a name to the 404 route
  // to later get current route name in the code
  '*': [ 'templates/404', 'notfound' ],
}
```

### Async template loading
Since we have a client router we should not include templates with all of the components of the routes. The size of the `app.prod.js` would be massive if we did that.

These templates are loaded asynchronously as the subview is requested. By default they stay inside `@templates/` directory.

### Preprocessors!
Yup, here they are!

We chose to use [pug](https://pugjs.org/), [stylus](http://stylus-lang.com/) and [bublé](https://buble.surge.sh/) but we are open to add support for more than just these three
