export const ADD_REDUCER = '@transient-react-reducer/ADD_REDUCER'
export const REMOVE_REDUCER = '@transient-react-reducer/REMOVE_REDUCER'

export const transientEnhancer = () => createStore => (reducer, preloaded, enhancer) => {
  const reducers = [reducer]
  const transientReducer = (state, action) => reducers.reduce(
    (state, reducer) => reducer(state, action), state
  )

  const store = createStore(transientReducer, preloaded, enhancer)
  const originalDispatch = store.dispatch

  const addReducer = reducer => reducers.indexOf(reducer) === -1
    ? reducers.push(reducer)
    : null

  const removeReducer = reducer => reducers.indexOf(reducer) === -1
    ? null
    : reducers.splice(reducers.indexOf(reducer), 1)

  // Middleware-like action interceptor to add/remove transient reducers.
  const dispatch = action => {
    if (action.type === REMOVE_REDUCER) removeReducer(action.reducer)
    const result = originalDispatch(action)
    if (action.type === ADD_REDUCER) addReducer(action.reducer)
    return result
  }

  return { ...store, dispatch }
}

// /**
//  * Transient reducer creator. Allows to configure
//  * where transient reducers are stored.
//  * @param {String} key Transient reducers key.
//  * @return {Function} reducer
//  */
// export const createTransientReducer = key => (state, action) => {
//   switch (action.type) {
//     case ADD_REDUCER: return over(
//       lensProp(key),
//       pipe(
//         defaultTo([]),
//         append(action.reducer)
//       )
//     )(state)
//
//     case REMOVE_REDUCER: return over(
//       lensProp(key),
//       pipe(
//         defaultTo([]),
//         compose(
//           filter,
//           complement,
//           equals
//         )(action.reducer)
//       )
//     )(state)
//
//     default: return propOr([], key, state).reduce(
//       (state, reducer) => reducer(state, action),
//       state
//     )
//   }
// }
//
// export const transientReducer = createTransientReducer('transientReducers')
