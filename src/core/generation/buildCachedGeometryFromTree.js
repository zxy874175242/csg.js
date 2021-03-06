
const generate = require('./generatePolygonal')
const makeCacheWithInvalidation = require('./cacheWithInvalidation')
const { flatten, toArray } = require('./arrays')

/**
 * higher order function returning a function that can be called to generate
 * geometry from a vtree, using caching (for root elements for now)
 */
const makeBuildCachedGeometryFromTree = (params) => {
  const defaults = {
    // how many passes we allow without cache hits before eliminating hashes/geometry from cache
    passesBeforeElimination: 1,
    lookup: {},
    lookupCounts: {}
  }
  const { passesBeforeElimination, lookup, lookupCounts } = Object.assign({}, defaults, params)
  const cache = makeCacheWithInvalidation(passesBeforeElimination, lookup, lookupCounts)

  const buildFinalResult = (tree, deep) => {
    return toArray(dfs(tree, cache))
  }

  // main function, this can be called every time one needs to generate
  // geometry from the vtree
  return function (params, tree) {
    const result = buildFinalResult(tree)
    // to remove potential no-hit items
    cache.update()
    return result
  }
}

const dfs = (node, cache) => {
  if (node.children) {
    flatten(node.children).forEach(function (childNode) {
      dfs(childNode, cache)
    })
  }
  return generate(node, cache)
}

module.exports = makeBuildCachedGeometryFromTree
