import React, { Component } from 'react'
import FridgeApi from 'fridge_api'
import { loadGetInitialProps } from 'next/dist/lib/utils'

const fridge = new FridgeApi({
  client_id: process.env.FRIDGE_ID,
  secret_secret: process.env.FRIDGE_SECRET
})

export default (ComposedComponent) => {
  return class extends Component {
    static async getInitialProps (ctx) {
      if (!ctx.fridge) {
        ctx.fridge = fridge
      }

      return {
        fridge,
        ...await loadGetInitialProps(ComposedComponent, ctx)
      }
    }

    render () {
      return <ComposedComponent {...this.props} fridge={fridge} />
    }
  }
}
