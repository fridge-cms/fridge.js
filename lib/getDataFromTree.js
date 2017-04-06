import reactTreeWalker from 'react-tree-walker'

export default (app, options) => {
  const visitor = (element, instance) => {
    if (instance && typeof instance.getFridgeProps === 'function') {
      return instance.getFridgeProps()
    }
    return true
  }

  return reactTreeWalker(app, visitor, {}, options)
}
