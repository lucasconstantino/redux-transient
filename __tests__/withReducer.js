import React from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'

import { ADD_REDUCER, REMOVE_REDUCER, transientEnhancer } from '../src/transient-enhancer'
import { withReducer } from '../src/withReducer'

describe('withReducer', () => {
  const reducers = {
    original: jest.fn(v => v),
    transient: jest.fn(v => v),
    counter: jest.fn(v => ++v),
  }

  const getStore = () => createStore(reducers.original, 0, transientEnhancer)

  const DumbComponent = () => (<div>Content</div>)
  const ConnectedComponent = withReducer(reducers.transient)(DumbComponent)

  const build = children => {
    const store = getStore()

    return {
      store,
      App: mount(<Provider store={ store }>{ children }</Provider>),
    }
  }

  beforeEach(jest.clearAllMocks)

  it('should add transient reducers', () => {
    build(<ConnectedComponent />)
    expect(reducers.original).toHaveBeenCalledTimes(2)
    expect(reducers.original).toHaveProperty('mock.calls.1.1.type', ADD_REDUCER)
  })

  it('should execute transient reducers on actions', () => {
    const { store } = build(<ConnectedComponent />)
    expect(reducers.transient).toHaveBeenCalledTimes(0)
    store.dispatch({ type: 'any-action' })
    expect(reducers.transient).toHaveBeenCalledTimes(1)
  })

  it('should remove transient reducers on unmount', () => {
    const { store, App } = build(<ConnectedComponent />)
    store.dispatch({ type: 'any-action' })
    expect(reducers.transient).toHaveBeenCalledTimes(1)

    App.unmount()
    expect(reducers.original).toHaveProperty('mock.calls.3.1.type', REMOVE_REDUCER)

    store.dispatch({ type: 'any-action' })
    expect(reducers.transient).toHaveBeenCalledTimes(1)
  })

  it('should execute transient reducers with state, actions, and passed props', () => {
    const { store, App } = build(<ConnectedComponent foo='bar' />)
    const state = store.getState()
    const action = { type: 'any-action' }

    const WithReducer = App.find(ConnectedComponent).find('WithReducer')

    store.dispatch(action)
    expect(reducers.transient).toHaveBeenCalledWith(state, action, WithReducer.props())
  })

  it.only('should add multiple transient reducers', () => {
    const { store } = build((
      <div>
        <ConnectedComponent foo={ 'a' } />
        <ConnectedComponent foo={ 'b' } />
        <ConnectedComponent foo={ 'c' } />
      </div>
    ))

    expect(reducers.original).toHaveBeenCalledTimes(4)
    expect(reducers.transient).toHaveBeenCalledTimes(3)

    // When 'b' was added, called 'a'.
    expect(reducers.transient).toHaveProperty('mock.calls.0.2.foo', 'a')

    // When 'c' was added, called 'a' and 'b'.
    expect(reducers.transient).toHaveProperty('mock.calls.1.2.foo', 'a')
    expect(reducers.transient).toHaveProperty('mock.calls.2.2.foo', 'b')

    // When another action is fired, call all 3.
    store.dispatch({ type: 'any-action' })
    expect(reducers.transient).toHaveBeenCalledTimes(6)
    expect(reducers.transient).toHaveProperty('mock.calls.3.2.foo', 'a')
    expect(reducers.transient).toHaveProperty('mock.calls.4.2.foo', 'b')
    expect(reducers.transient).toHaveProperty('mock.calls.5.2.foo', 'c')
  })
})
