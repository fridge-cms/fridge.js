<h1 align="center">Fridge.js</h1>

<div align="center">
  Build <a href="https://www.fridgecms.com">Fridge</a> powered apps using next.js
</div>

## Installation

```
$ npm install --save fridge-next next react react-dom
```

## Examples

* [Basic Blog](https://github.com/fridge-cms/examples/tree/master/next-basic-blog)
* [Contact Form](https://github.com/fridge-cms/examples/tree/master/next-contact-form)

## How to use

### Setup

Add a script to your package.json like this:

```json
{
  "scripts": {
    "dev": "fridge",
    "build": "fridge build",
    "start": "fridge start"
  }
}
```

Add a fridge API configuration to `next.config.js`:

```js
const withFridge = require('fridge-next/config');

module.exports = withFridge({
  fridge: {
    token: 'xxxxxxxxxx'
  }
});
```

### Usage

Create a custom `_app.js`.

```js
// pages/_app.js

import { FridgeApp } from 'fridge-next'
export default FridgeApp
```

This will provide your page components a `fridge` client in `getInitialProps` context as well as a prop of the component.

#### HOC

There is an HOC to wrap non-page components. `withFridge` accepts a promise function that returns props to be added to the wrapped component.

```js
import React from 'react'
import { withFridge } from 'fridge-next'

const Footer = ({settings}) =>
  <footer>
    <p>{settings.copyright}</p>
  </footer>

export default withFridge(async ({fridge, props}) => {
  return {
    settings: await fridge.get('content/settings')
  }
})(Footer)
```

#### Render Function

If HOCs aren't your thing, this is also a `<Fridge>` component which accepts a render function as its child. You can provide a `query` prop with can be a string or array of strings of queries to pass to Fridge.

```js
import { Fridge, HtmlContent } from 'fridge-next'

export default ({ id }) =>
  <Fridge query={`content/team_member/${id}`}>
    {teamMember =>
      <div>
        <h3>{teamMember.name}</h3>
        <HtmlContent content={teamMember.bio} />
      </div>
    }
  </Fridge>
```

### Custom Routes

#### SSR

Provide a `routes` object in `next.config.js`:

> `routes: {[path: string]: string | {page: string, query: Object}}`

```js
module.exports = {
  routes: {
    "/blog/:slug": "/blog",
    "/*": {"page": "/page", "query": {"fallback": "true"}}
  }
}
```

#### Export

Use `exportPathMap` in `next.config.js` to provide custom routes. These routes are intended for use with `fridge export`, however if you specify `useExportRoutes: true` in `next.config.js` then these routes will be added in production:

```js
module.exports = {
  exportPathMap: async (fridge, defaultPathMap) => {
    const members = await fridge.get('content/team_member');
    for (const member of members) {
      defaultPathMap[`/team/${member.slug}`] = {page: '/team', query: {id: member.id}};
    }
    return defaultPathMap;
  }
}
```

#### Now

Add custom routing to `now.json`:

```json
{
  "version": 2,
  "builds": [
    { "src": "next.config.js", "use": "@now/next" }
  ],
  "routes": [
    { "src": "/", "dest": "/" },
    { "src": "/blog/(?<slug>[^/]*)", "dest": "/blog?slug=$slug" },
    { "src": "/team/(?<id>[^/]*)", "dest": "/team?id=$id" }
  ]
}
```

If you are using now v2, you must use next's `BUILD_PHASES` to control when to require `fridge-next`. See this issue for more information: https://github.com/zeit/next.js/issues/5750

### Next.js

We use next.js internally to power everything, see their docs for further customization [next.js](https://github.com/zeit/next.js)
