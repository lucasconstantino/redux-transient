import {
  ADD_REDUCER,
  REMOVE_REDUCER,
  addReducer,
  removeReducer,
  transientEnhancer,
} from '../src/transient-enhancer'

import { createStore, combineReducers } from 'redux'

describe('transientEnhancer', () => {
  const reducers = {
    original: jest.fn(v => v),
    transient: jest.fn(v => v),
    counter: jest.fn((v = 0) => ++v),
    timestamp: jest.fn(() => new Date().getTime()),
  }
  const getStore = () => createStore(reducers.original, 0, transientEnhancer)

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
    expect(reducers.transient).toHaveBeenCalledTimes(0)
  })

  it('should not add same transient reducer twice', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    store.dispatch({ type: 'any-action' })

    expect(reducers.original).toHaveBeenCalledTimes(4)
    expect(reducers.transient).toHaveBeenCalledTimes(2)
  })

  it('should be possible to add same transient reducer twice (with flag)', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient, allowRepeated: true })
    store.dispatch({ type: 'any-action' })

    expect(reducers.original).toHaveBeenCalledTimes(4)
    expect(reducers.transient).toHaveBeenCalledTimes(3)
  })

  it('should be possible for a transient reducer to alter state', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.counter })
    store.dispatch({ type: 'any-action' })
    expect(store.getState()).toBe(1)
  })

  it('should execute transient reducer on any actions after adding', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(2)
    expect(reducers.transient).toHaveBeenCalledTimes(0)

    store.dispatch({ type: 'any-action' })
    expect(reducers.original).toHaveBeenCalledTimes(3)
    expect(reducers.transient).toHaveBeenCalledTimes(1)
  })

  it('should be possible to add multiple transient reducers', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.counter })
    expect(reducers.original).toHaveBeenCalledTimes(3)
    expect(reducers.transient).toHaveBeenCalledTimes(1)
    expect(reducers.counter).toHaveBeenCalledTimes(0)
  })

  it('should be possible to remove transient reducers', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(2)
    expect(reducers.transient).toHaveBeenCalledTimes(0)

    store.dispatch({ type: 'any-action' })
    expect(reducers.original).toHaveBeenCalledTimes(3)
    expect(reducers.transient).toHaveBeenCalledTimes(1)

    store.dispatch({ type: REMOVE_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(4)
    expect(reducers.transient).toHaveBeenCalledTimes(1)
  })

  it('should remove only first occurence for repeated transient reducers', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient, allowRepeated: true })
    expect(reducers.original).toHaveBeenCalledTimes(3)
    expect(reducers.transient).toHaveBeenCalledTimes(1)

    store.dispatch({ type: REMOVE_REDUCER, reducer: reducers.transient })
    store.dispatch({ type: 'any-action' })

    expect(reducers.original).toHaveBeenCalledTimes(5)
    expect(reducers.transient).toHaveBeenCalledTimes(3)

    store.dispatch({ type: REMOVE_REDUCER, reducer: reducers.transient })
    store.dispatch({ type: 'any-action' })

    expect(reducers.original).toHaveBeenCalledTimes(7)
    expect(reducers.transient).toHaveBeenCalledTimes(3)
  })

  it('should be possible to remove all occurences for repeated transient reducers', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient, allowRepeated: true })
    expect(reducers.original).toHaveBeenCalledTimes(3)
    expect(reducers.transient).toHaveBeenCalledTimes(1)

    store.dispatch({ type: REMOVE_REDUCER, reducer: reducers.transient, removeRepeated: true })
    store.dispatch({ type: 'any-action' })

    expect(reducers.original).toHaveBeenCalledTimes(5)
    expect(reducers.transient).toHaveBeenCalledTimes(1)
  })

  it('should not execute transient reducer on any action after removal', () => {
    const store = getStore()
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(2)
    expect(reducers.transient).toHaveBeenCalledTimes(0)

    store.dispatch({ type: 'any-action' })
    expect(reducers.original).toHaveBeenCalledTimes(3)
    expect(reducers.transient).toHaveBeenCalledTimes(1)

    store.dispatch({ type: REMOVE_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(4)
    expect(reducers.transient).toHaveBeenCalledTimes(1)

    store.dispatch({ type: 'any-action' })
    expect(reducers.original).toHaveBeenCalledTimes(5)
    expect(reducers.transient).toHaveBeenCalledTimes(1)
  })

  it('should keep other transient reducers intact when removing one', () => {
    const store = getStore()

    store.dispatch({ type: ADD_REDUCER, reducer: reducers.transient })
    store.dispatch({ type: ADD_REDUCER, reducer: reducers.counter })
    expect(reducers.original).toHaveBeenCalledTimes(3)
    expect(reducers.transient).toHaveBeenCalledTimes(1)
    expect(reducers.counter).toHaveBeenCalledTimes(0)

    store.dispatch({ type: REMOVE_REDUCER, reducer: reducers.transient })
    expect(reducers.original).toHaveBeenCalledTimes(4)
    expect(reducers.transient).toHaveBeenCalledTimes(1)
    expect(reducers.counter).toHaveBeenCalledTimes(1)
  })

  describe('[integration] redux/combineReducers', () => {
    const reducer = combineReducers({
      counter: reducers.counter,
      timestamp: reducers.timestamp,
    })
    const getStore = () => createStore(reducer, {}, transientEnhancer)

    it('should work with combineReducers', () => {
      const store = getStore()
      expect(reducers.counter).toHaveBeenCalledTimes(1)
      expect(reducers.timestamp).toHaveBeenCalledTimes(1)
      expect(store.getState()).toHaveProperty('counter', 1)

      store.dispatch(addReducer(reducers.transient))

      expect(reducers.counter).toHaveBeenCalledTimes(2)
      expect(reducers.timestamp).toHaveBeenCalledTimes(2)
      expect(reducers.transient).toHaveBeenCalledTimes(0)
      expect(store.getState()).toHaveProperty('counter', 2)

      store.dispatch({ type: 'any' })

      expect(reducers.counter).toHaveBeenCalledTimes(3)
      expect(reducers.timestamp).toHaveBeenCalledTimes(3)
      expect(reducers.transient).toHaveBeenCalledTimes(1)
      expect(store.getState()).toHaveProperty('counter', 3)
    })
  })
})
