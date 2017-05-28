import {
  ADD_REDUCER,
  REMOVE_REDUCER,
  transientEnhancer,
} from '../src/transient-enhancer'

import { createStore } from 'redux'

describe('transientEnhancer', () => {
  const reducers = {
    original: jest.fn(v => v),
    transient: jest.fn(v => v),
    counter: jest.fn(v => ++v),
  }
  const getStore = () => createStore(reducers.original, 0, transientEnhancer())

  beforeEach(jest.clearAllMocks)

  /*
   * ON THE TESTS BELOW, ALWAYS CONSIDER '@@redux/INIT' ACTION.
   */

  it('should execute original reducer transparently', () => {
    getStore().dispatch({ type: 'any-action' })
    expect(reducers.original).toHaveBeenCalledTimes(2)
  })

  it('should be possible to add transient reducers', () => {
    getStore().dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(2)
    expect(reducers.transient).toHaveBeenCalledTimes(1)
  })

  it('should not be possible to add same transient reducer twice', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(3)
    expect(reducers.transient).toHaveBeenCalledTimes(2)
  })

  it('should be possible for a transient reducer to alter state', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.counter })
    expect(store.getState()).toBe(1)
  })

  it('should execute transient reducer on any actions after adding', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(2)
    expect(reducers.transient).toHaveBeenCalledTimes(1)

    store.dispatch({ type: 'any-action' })
    expect(reducers.original).toHaveBeenCalledTimes(3)
    expect(reducers.transient).toHaveBeenCalledTimes(2)
  })

  it('should be possible to add multiple transient reducers', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.counter })
    expect(reducers.original).toHaveBeenCalledTimes(3)
    expect(reducers.transient).toHaveBeenCalledTimes(2)
    expect(reducers.counter).toHaveBeenCalledTimes(1)
  })

  it('should be possible to remove transient reducers', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(2)
    expect(reducers.transient).toHaveBeenCalledTimes(1)

    store.dispatch({ type: REMOVE_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(3)
    expect(reducers.transient).toHaveBeenCalledTimes(1)
  })

  it('should not execute transient reducer on any action after removal', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(2)
    expect(reducers.transient).toHaveBeenCalledTimes(1)

    store.dispatch({ type: REMOVE_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(3)
    expect(reducers.transient).toHaveBeenCalledTimes(1)

    store.dispatch({ type: 'any-action' })
    expect(reducers.original).toHaveBeenCalledTimes(4)
    expect(reducers.transient).toHaveBeenCalledTimes(1)
  })

  it('should keep other transient reducers intact when removing one', () => {
    const store = getStore()

    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.counter })
    expect(reducers.original).toHaveBeenCalledTimes(3)
    expect(reducers.transient).toHaveBeenCalledTimes(2)
    expect(reducers.counter).toHaveBeenCalledTimes(1)

    store.dispatch({ type: REMOVE_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(4)
    expect(reducers.transient).toHaveBeenCalledTimes(2)
    expect(reducers.counter).toHaveBeenCalledTimes(2)
  })
})
