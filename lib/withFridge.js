import React, { Component } from "react";
import PropTypes from "prop-types";
import hoistNonReactStatics from "hoist-non-react-statics";

export default getProps => ComposedComponent => {
  class Fridge extends Component {
    static contextTypes = {
      fridge: PropTypes.object.isRequired,
      store: PropTypes.object.isRequired
    };

    state = {
      fridgeProps: {}
    };

    setId() {
      const { store } = this.context;
      this.id = store.getNextId();
    }

    componentWillMount() {
      if (!this.id) this.setId();
      const { store } = this.context;
      const fridgeProps = store.get(this.id) || {};

      this.setState({ fridgeProps });
    }

    componentWillUnmount() {
      this.unmounted = true;
    }

    componentDidMount() {
      if (this.shouldResolve()) this.getFridgeProps();
    }

    getFridgeProps = async () => {
      if (typeof getProps !== "function") return true;
      const { fridge, store } = this.context;

      // getFridgeProps is being called from
      // react-tree-walker, we need to set our id
      if (!this.id) this.setId();

      try {
        this.resolving = true;
        const fridgeProps = await getProps({ fridge, props: this.props });
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
        typeof getProps === "function" &&
        typeof window !== "undefined" &&
        !this.resolving
      );
    }

    render() {
      const { fridge } = this.context;
      const { fridgeProps } = this.state;

      if (this.shouldResolve()) this.getFridgeProps();

      const props = {
        ...this.props,
        ...fridgeProps,
        fridge
      };

      return this.resolving && !fridgeProps ? null : (
        <ComposedComponent {...props} />
      );
    }
  }

  return hoistNonReactStatics(Fridge, ComposedComponent, {});
};
