import React from "react";
import PropTypes from "prop-types";

export default class Fridge extends React.Component {
  static contextTypes = {
    fridge: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  };

  static propTypes = {
    children: PropTypes.func.isRequired
  };

  state = {
    fridgeProps: null
  };

  setId() {
    const { store } = this.context;
    this.id = store.getNextId();
  }

  componentWillMount() {
    if (!this.id) this.setId();
    const { store } = this.context;
    const fridgeProps = store.get(this.id) || null;

    this.setState({ fridgeProps });
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  componentDidMount() {
    if (this.shouldResolve()) this.getFridgeProps();
  }

  getFridgeProps = async () => {
    const { fridge, store } = this.context;
    const { query } = this.props;

    if (!query) return true;

    // getFridgeProps is being called from
    // react-tree-walker, we need to set our id
    if (!this.id) this.setId();

    try {
      this.resolving = true;

      const queries = [].concat(query);
      const fridgeProps = await Promise.all(queries.map(q => fridge.get(q)));

      if (this.unmounted) return false;

      store.register(this.id, fridgeProps);
      this.resolving = false;

      if (this.setState) {
        this.setState({ fridgeProps, resolved: true });
      }
    } catch (err) {
      this.resolving = false;
      throw new Error("Failed to resolve connected Fridge component");
    }

    return true;
  };

  shouldResolve() {
    return (
      this.context.store.get(this.id) == null &&
      typeof window !== "undefined" &&
      !this.resolving
    );
  }

  render() {
    const { fridgeProps } = this.state;
    const { children } = this.props;

    if (this.shouldResolve()) this.getFridgeProps();

    return this.resolving && !fridgeProps ? null : children(...fridgeProps);
  }
}
