<h1 align="center">Fridge.js</h1>

<div align="center">
  Build <a href="https://www.fridgecms.com">Fridge</a> powered apps using next.js
</div>

## Installation

```
$ npm install --save fridge-next next react react-dom
```

## Examples

- [Basic Blog](https://github.com/fridge-cms/examples/tree/master/next-basic-blog)
- [Contact Form](https://github.com/fridge-cms/examples/tree/master/next-contact-form)

## How to use

### Setup

Add a fridge API configuration to `next.config.js`:

```js
const withFridge = require("fridge-next/config");

module.exports = withFridge({
  fridge: {
    token: "xxxxxxxxxx",
  },
});
```

### Usage

### getStaticProps

```js
import { fridge } from "fridge-next";

export async function getStaticProps({ params }) {
  const content = await fridge(`content/${params.id}`);

  return {
    props: { content },
  };
}
```

#### Hook

```js
import React from "react";
import { useFridge } from "fridge-next";

const Footer = () => {
  const { data: settings } = useFridge("content/settings");

  return <footer>{!!settings && <p>{settings.copyright}</p>}</footer>;
};
```

#### Render Function

There is also a `<FridgeContent>` component which accepts a render function as its child. You can provide a `query` prop with can be a string or array of strings of queries to pass to Fridge.

```js
import { FridgeContent, HtmlContent } from "fridge-next";

export default ({ id }) => (
  <FridgeContent query={`content/team_member/${id}`}>
    {(teamMember) => (
      <div>
        <h3>{teamMember.name}</h3>
        <HtmlContent content={teamMember.bio} />
      </div>
    )}
  </FridgeContent>
);
```

### Custom Routes

#### SSR

Provide a `routes` object in `next.config.js`:

> `routes: {[path: string]: string | {page: string, query: Object}}`

```js
module.exports = {
  routes: {
    "/blog/:slug": "/blog",
    "/*": { page: "/page", query: { fallback: "true" } },
  },
};
```

#### Export

Use `exportPathMap` in `next.config.js` to provide custom routes. These routes are intended for use with `fridge export`, however if you specify `useExportRoutes: true` in `next.config.js` then these routes will be added in production:

```js
module.exports = {
  exportPathMap: async (fridge, defaultPathMap) => {
    const members = await fridge.get("content/team_member");
    for (const member of members) {
      defaultPathMap[`/team/${member.slug}`] = {
        page: "/team",
        query: { id: member.id },
      };
    }
    return defaultPathMap;
  },
};
```

#### Now

Set `target: "serverless"` in `next.config.js`.

Add custom routing to `now.json`:

```json
{
  "version": 2,
  "builds": [{ "src": "next.config.js", "use": "@now/next" }],
  "routes": [
    { "src": "/", "dest": "/" },
    { "src": "/blog/(?<slug>[^/]*)", "dest": "/blog?slug=$slug" },
    { "src": "/team/(?<id>[^/]*)", "dest": "/team?id=$id" }
  ]
}
```

> Note: If you are deploying to a serverless environment, you don't need custom SSR routes.

### Next.js

We use next.js internally to power everything, see their docs for further customization [next.js](https://github.com/zeit/next.js)
