import reactTreeWalker from 'react-tree-walker'

const getRequestsFromTree = (rootElement, rootContext = {}, fetchRoot = true) => {
  const reqs = []

  reactTreeWalker(rootElement, (element, instance, context) => {
    const skipRoot = !fetchRoot && (element === rootElement)
    if (instance && typeof instance.getFridgeProps === 'function' && !skipRoot) {
      const req = instance.getFridgeProps()
      if (req) {
        reqs.push({req, element, context})

        // Don't let walker render() the component
        return false
      }
    }
  }, rootContext)

  return reqs
}

const getDataFromTree = async (rootElement, rootContext = {}, fetchRoot = true) => {
  const reqs = getRequestsFromTree(rootElement, rootContext, fetchRoot)

  if (!reqs.length) return Promise.resolve()

  const mapped = reqs.map(({req, element, context}) => {
    return req.then(_ => getDataFromTree(element, context, false))
  })

  return Promise.all(mapped).then(_ => null)
}

export default getDataFromTree
