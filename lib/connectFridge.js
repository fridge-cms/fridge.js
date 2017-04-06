import React, { Component, PropTypes } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'

export default getProps => ComposedComponent => {
  let id = null

  class Fridge extends Component {
    static contextTypes = {
      fridge: PropTypes.object.isRequired,
      store: PropTypes.object.isRequired
    }

    state = {props: null}

    constructor (props, context) {
      super(props, context)

      const {store} = context

      if (process.browser) {
        id = store.getNextId()
      }

      if (id) {
        const state = store.get(id)
        if (state) {
          this.state = {props: state}
        }
      }
    }

    getFridgeProps = async () => {
      const {fridge, store} = this.context
      const props = await getProps({fridge, props: this.props})
      if (this.unmounted) return false

      if (!id) {
        id = store.getNextId()
      }

      store.register(id, props)
      if (this.setState) {
        this.setState({props})
      }

      return true
    }

    componentWillUnmount () {
      this.unmounted = true
    }

    render () {
      const {fridge} = this.context

      const props = {
        ...this.props,
        ...this.state.props,
        fridge
      }

      return <ComposedComponent {...props} />
    }
  }

  return hoistNonReactStatics(Fridge, ComposedComponent, {})
}
