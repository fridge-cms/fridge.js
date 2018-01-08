import React, { Component } from 'react'
import PropTypes from 'prop-types'
import hoistNonReactStatics from 'hoist-non-react-statics'

export default getProps => ComposedComponent => {
  let id

  class Fridge extends Component {
    static contextTypes = {
      fridge: PropTypes.object.isRequired,
      store: PropTypes.object.isRequired
    }

    state = {props: null}

    constructor (props, context) {
      super(props, context)

      const {store} = context

      id = store.getNextId()
      this.state = {props: store.get(id) || null}
    }

    getFridgeProps = async () => {
      const {fridge, store} = this.context
      const props = await getProps({fridge, props: this.props})
      if (this.unmounted) return false

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
