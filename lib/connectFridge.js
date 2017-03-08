import React, { Component, PropTypes } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'

export default getProps => ComposedComponent => {
  class Fridge extends Component {
    static contextTypes = {
      fridge: PropTypes.object.isRequired,
      store: PropTypes.object.isRequired
    }

    state = {props: null}

    constructor (props, context) {
      super(props, context)

      if (!props.id) {
        throw new Error('fridge-next requires a unique `id` prop on components. This is a stop-gap until React has a better way to track unique component instances.')
      }

      const {store} = context

      // this.id = this._componentFingerprint()
      // if (!id) {
      //   id = store.getNextId()
      //   console.log('getting id', id)
      // }

      const state = store.get(props.id)
      if (state) {
        this.state = {props: state}
      }
    }

    getFridgeProps = async () => {
      const {fridge, store} = this.context
      const props = await getProps({fridge, props: this.props})
      if (this.unmounted) return

      store.register(this.props.id, props)
      if (this.setState) {
        this.setState({props})
      }
    }

    // _componentFingerprint () {
    //   let instance = this._reactInternalInstance
    //   let rootNodeID = instance._rootNodeID
    //   let mountDepth = 0
    //   while (instance._currentElement._owner) {
    //     mountDepth += 1
    //     instance = instance._currentElement._owner
    //   }
    //   return `${rootNodeID}__${mountDepth}`
    // }

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
