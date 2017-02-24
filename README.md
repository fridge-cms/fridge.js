# fridge.js
Build Fridge apps using next.js

## How to use

### Setup

```
$ npm install --save fridge-next react react-dom
```

Add a script to your package.json like this:

```json
{
  "scripts": {
    "dev": "fridge start"
  }
}
```

Add a fridge API configuration to `next.config.js`:

```js
const config = require('fridge-next/config')

module.exports = config({
  fridge: {
    client_id: 'pk_xxxxxxxxxx'
  }
})
```

### Usage

Wrap top-level components with the `withFridge` higher-order component. This will include the Fridge API client both server and client side. Fridge will also be included in the context of `getInitialProps` and as a prop of the component.

```js
import React from 'react'
import withFridge from 'fridge-next/withFridge'

class Page extends React.Component {
  static async getInitialProps ({ fridge }) {
    const homepageContent = fridge.get('type/homepage')

    return { homepageContent }
  }

  render () {
    const { homepageContent: { content }} = this.props

    return <h1>{content.title}</h1>
  }
}
```

For any other components that need access to fridge data, there is another higher-order component `connectFridge`. Provide an `async` that returns props and they will be provided to the component.

```js
import React from 'react'
import connectFridge from 'fridge-next/connectFridge'

const Footer = ({settings}) =>
  <footer>
    <p>{settings.content.copyright}</p>
  </footer>

export default connectFridge(async ({fridge, props}) => {
  return {
    settings: await fridge.get('type/settings')
  }
})(Footer)
```

### Routes

In order to provide custom/parameterized routing to pages, provide a `routes` hash in `next.config.js`. Keys represent the route and values represent the next.js page path to render. Any route parameters will be passed into the `query` hash in the `getInitialProps` context.

```js
module.exports = {
  fridge: {...},
  routes: {
    '/:page': '/page',
    '/blog/:slug': '/blog'
  }
}
```

### Next.js

We use next.js internally to power everything, see their docs for further customization [next.js](https://github.com/zeit/next.js)
