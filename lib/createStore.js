export default function (initialState = {}) {
  let idPointer = 0
  const registry = initialState
  return {
    getNextId: () => {
      idPointer += 1
      return idPointer
    },
    register (id, state) {
      registry[id] = state
    },
    get (id) {
      return registry[id]
    },
    getState () {
      return registry
    }
  }
}
