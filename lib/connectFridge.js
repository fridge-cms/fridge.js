import React, { Component, PropTypes } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'

let _globalCounter = 0

export default getProps => ComposedComponent => {
  const id = ++_globalCounter

  class Fridge extends Component {
    static contextTypes = {
      fridge: PropTypes.object.isRequired,
      store: PropTypes.object.isRequired
    }

    getFridgeProps = async () => {
      const {fridge, store} = this.context
      const props = await getProps({fridge, props: this.props})
      store.set(id, props)
    }

    render () {
      const {fridge, store} = this.context

      const props = {
        ...this.props,
        ...store.get(id),
        fridge
      }

      return <ComposedComponent {...props} />
    }
  }

  return hoistNonReactStatics(Fridge, ComposedComponent, {})
}
