import App, { Container } from 'next/app'
import Fridge from 'fridge'
import { loadGetInitialProps } from 'next/dist/lib/utils'
import getDataFromTree from './getDataFromTree'
import FridgeProvider from './FridgeProvider'
import createStore from './createStore'

const fridge = new Fridge({token: process.env.FRIDGE_TOKEN})

export default class extends App {
  static async getInitialProps ({ Component, router, ctx }) {
    const store = createStore()
    const pageProps = await loadGetInitialProps(Component, {...ctx, fridge})

    if (!process.browser) {
      const app = <FridgeProvider fridge={fridge} store={store}>
        <Container>
          <Component {...pageProps} />
        </Container>
      </FridgeProvider>
      await getDataFromTree(app)
    }

    return {pageProps, initialState: store.getState()}
  }

  constructor (props) {
    super(props)

    this.fridge = fridge
    this.store = createStore(props.initialState)
  }

  render () {
    const {Component, pageProps} = this.props
    return <Container>
      <FridgeProvider fridge={this.fridge} store={this.store}>
        <Component {...pageProps} />
      </FridgeProvider>
    </Container>
  }
}
