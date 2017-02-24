let fridgeStore = null

class Store {
  constructor (initialState = {}) {
    this._data = initialState
  }

  get (key) {
    return this._data.hasOwnProperty(key) ? this._data[key] : undefined
  }

  set (key, value) {
    this._data = {...this._data, [key]: value}
  }

  getState () {
    return this._data
  }
}

export default (initialState = {}) => {
  let store

  if (!process.browser || !fridgeStore) {
    store = new Store(initialState)
    if (!process.browser) {
      return store
    }
    fridgeStore = store
  }

  return fridgeStore
}
