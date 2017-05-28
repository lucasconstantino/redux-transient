import { Component, createElement } from 'react'
import { connect } from 'react-redux'

import { addReducer, removeReducer } from './transient-enhancer'

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
    this.props.dispatch(addReducer(this.reducer))
  }

  componentWillUnmount () {
    this.props.dispatch(removeReducer(this.reducer))
  }

  render () {
    return createElement(WrappedComponent, this.props)
  }
})
