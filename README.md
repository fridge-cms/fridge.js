<h1 align="center">Fridge.js</h1>

<div align="center">
  Build <a href="https://www.fridgecms.com">Fridge</a> powered apps using next.js
</div>

## How to use

### Setup

```
$ npm install --save fridge-next react react-dom
```

Add a script to your package.json like this:

```json
{
  "scripts": {
    "dev": "fridge",
    "build": "fridge build",
    "start": "NODE_ENV=production fridge"
  }
}
```

Add a fridge API configuration to `next.config.js`:

```js
module.exports = {
  fridge: {
    client_id: 'pk_xxxxxxxxxx'
  }
}
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

If HOCs aren't your thing, this is also a `<Fridge>` component which accepts a render function as its child. You can provide a `query` prop with can be a string, array, or a function which must return 1 or more strings of queries to pass to Fridge.

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

### Routes

Use `exportPathMap` from next.js to provide custom routes.

```js
module.exports = {
  fridge: {...},
  exportPathMap: async (fridge, defaultPathMap) => {
    const members = await fridge.get('content/team_member')
    for (const member of members) {
      defaultPathMap[`/team/${member.slug}`] = {page: '/team', query: {id: member.id}}
    }
    defaultPathMap
  }
}
```

### Next.js

We use next.js internally to power everything, see their docs for further customization [next.js](https://github.com/zeit/next.js)
