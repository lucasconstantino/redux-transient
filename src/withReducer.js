import { Component, createElement } from 'react'
import { connect } from 'react-redux'

import { ADD_REDUCER, REMOVE_REDUCER } from './transient-enhancer'

/**
 * HoC factory for a transient reducer connected component.
 * @param {Function} _reducer Transient reducer.
 * @return {Function} Higher-Order component.
 */
export const withReducer = reducer => WrappedComponent => connect()(class WithReducer extends Component {
  constructor (...args) {
    super(...args)
    this.reducer = (state, action) => reducer(state, action, this.props)
  }

  componentWillMount () {
    this.props.dispatch({ type: ADD_REDUCER, reducer: this.reducer })
  }

  componentWillUnmount () {
    this.props.dispatch({ type: REMOVE_REDUCER, reducer: this.reducer })
  }

  render () {
    return createElement(WrappedComponent, this.props)
  }
})
