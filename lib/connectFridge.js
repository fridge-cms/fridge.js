import React, { Component, PropTypes } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'

export default getProps => ComposedComponent => {
  let id = null

  class Fridge extends Component {
    static contextTypes = {
      fridge: PropTypes.object.isRequired,
      store: PropTypes.object.isRequired
    }

    constructor (props, context) {
      super(props)

      const {store} = context

      if (!id) {
        id = store.getNextId()
      }

      const state = store.get(id)
      this.state = {props: state || null}
    }

    getFridgeProps = async () => {
      const {fridge, store} = this.context
      const props = await getProps({fridge, props: this.props})
      if (this.unmounted) return

      store.register(id, props)
      if (this.setState) {
        this.setState({props})
      }
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
