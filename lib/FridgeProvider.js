import { Component, Children } from 'react'
import PropTypes from 'prop-types'

export default class extends Component {
  static propTypes = {
    fridge: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  }

  static childContextTypes = {
    fridge: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.fridge = props.fridge
    this.store = props.store
    this.store.resetIds()
  }

  getChildContext () {
    return {
      fridge: this.fridge,
      store: this.store
    }
  }

  render () {
    return Children.only(this.props.children)
  }
}
