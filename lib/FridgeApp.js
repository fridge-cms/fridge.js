import App, { Container } from "next/app";
import Fridge from "fridge";
import getDataFromTree from "./getDataFromTree";
import FridgeProvider from "./FridgeProvider";
import createStore from "./createStore";

const fridge = new Fridge({ token: process.env.FRIDGE_TOKEN });

const isResSent = res => {
  return res.finished || res.headersSent;
};

const getDisplayName = Component => {
  if (typeof Component === "string") {
    return Component;
  }

  return Component.displayName || Component.name || "Unknown";
};

const loadGetInitialProps = async (Component, ctx) => {
  if (process.env.NODE_ENV !== "production") {
    if (Component.prototype && Component.prototype.getInitialProps) {
      const compName = getDisplayName(Component);
      const message = `"${compName}.getInitialProps()" is defined as an instance method - visit https://err.sh/zeit/next.js/get-initial-props-as-an-instance-method for more information.`;
      throw new Error(message);
    }
  }

  if (!Component.getInitialProps) return {};

  const props = await Component.getInitialProps(ctx);

  if (ctx.res && isResSent(ctx.res)) {
    return props;
  }

  if (!props) {
    const compName = getDisplayName(Component);
    const message = `"${compName}.getInitialProps()" should resolve to an object. But found "${props}" instead.`;
    throw new Error(message);
  }

  return props;
};

export default class extends App {
  static async getInitialProps({ Component, router, ctx }) {
    const store = createStore();
    const pageProps = await loadGetInitialProps(Component, { ...ctx, fridge });

    if (!process.browser) {
      const app = (
        <FridgeProvider fridge={fridge} store={store}>
          <Container>
            <Component {...pageProps} />
          </Container>
        </FridgeProvider>
      );
      await getDataFromTree(app);
    }

    return { pageProps, initialState: store.getState() };
  }

  constructor(props) {
    super(props);

    this.fridge = fridge;
    this.store = createStore(props.initialState);
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <Container>
        <FridgeProvider fridge={this.fridge} store={this.store}>
          <Component {...pageProps} />
        </FridgeProvider>
      </Container>
    );
  }
}
