import React, { Component } from 'react'
import Fridge from 'fridge'
import { loadGetInitialProps } from 'next/dist/lib/utils'
import getDataFromTree from './getDataFromTree'
import FridgeProvider from './FridgeProvider'
import createStore from './createStore'

const fridge = new Fridge({
  client_id: process.env.FRIDGE_ID,
  client_secret: process.env.FRIDGE_SECRET
})

export default (ComposedComponent) => {
  return class extends Component {
    static async getInitialProps (ctx) {
      const store = createStore()

      const props = {
        ...await loadGetInitialProps(ComposedComponent, {...ctx, fridge})
      }

      if (!process.browser) {
        const app = (
          <FridgeProvider fridge={fridge} store={store}>
            <ComposedComponent {...props} />
          </FridgeProvider>
        )
        await getDataFromTree(app)
      }

      return {
        ...props,
        initialState: store.getState()
      }
    }

    constructor (props) {
      super(props)

      this.fridge = fridge
      this.store = createStore(props.initialState)
    }

    render () {
      return <FridgeProvider fridge={this.fridge} store={this.store}>
        <ComposedComponent {...this.props} />
      </FridgeProvider>
    }
  }
}
