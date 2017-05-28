import {
  ADD_REDUCER,
  REMOVE_REDUCER,
  transientEnhancer,
} from './transient-enhancer'

export { transientEnhancer }
export const actions = { ADD_REDUCER, REMOVE_REDUCER }
export const enhancer = transientEnhancer // alias
