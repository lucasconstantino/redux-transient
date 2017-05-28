import {
  ADD_REDUCER,
  REMOVE_REDUCER,
  addReducer,
  removeReducer,
  transientEnhancer,
} from './transient-enhancer'

export { addReducer, removeReducer, transientEnhancer }
export const actions = { ADD_REDUCER, REMOVE_REDUCER }
export const enhancer = transientEnhancer // alias
