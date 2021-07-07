/**
 * Requires a module at run-time without Webpack mangling
 */
export const requireAtRuntime =
  typeof __webpack_require__ === 'function'
    ? __non_webpack_require__ // eslint-disable-line
    : require;
