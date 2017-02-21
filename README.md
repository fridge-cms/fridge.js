# fridge.js
Build Fridge apps using next.js

## How to use

### Setup

```
$ npm install --save fridge-next react react-dom
```

Add a script to your package.json like this:

```
{
  "scripts": {
    "dev": "fridge start"
  }
}
```

Add a fridge API configuration to `next.config.js`:

```
const config = require('fridge-next/config')

module.exports = config({
  fridge: {
    client_id: 'pk_xxxxxxxxxx'
  }
})
```

### Usage

A higher-order component is provided to include the Fridge API client both server and client side. Fridge will be included in the context of `getInitialProps` and as a prop to the component.

```
import React from 'react'
import withFridge from 'fridge-next/withFridge'

class Page extends React.Component {
  static async getInitialProps ({ fridge }) {
    const homepageContent = fridge.get('content/homepage')

    return { homepageContent }
  }

  render () {
    const { homepageContent: { content }} = this.props

    return <h1>{content.title}</h1>
  }
}

```

### Next.js

We use next.js internally to power everything, see their docs for further customization [next.js](https://github.com/zeit/next.js)
