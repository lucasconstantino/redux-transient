# Redux Transient [![Build Status](https://travis-ci.org/lucasconstantino/redux-transient.svg?branch=master)](https://travis-ci.org/lucasconstantino/redux-transient) [![sponsored by Taller](https://raw.githubusercontent.com/TallerWebSolutions/tallerwebsolutions.github.io/master/sponsored-by-taller.png)](https://taller.net.br/en/)

> Transient reducers for Redux

## Why?

Having the possibility to attach/detach specific reducers to your [Redux](redux.js.org/) store after initialized is definitely not a common need. Nevertheless, I felt that, when using Redux as a simple UI state holder for [React](https://facebook.github.io/react/) apps, oftentimes it gets really boring to create actions and reducers and constants for all the minor changes the App performs. Most of the times I would just stop using the store and use [Recompose](https://github.com/acdlite/recompose/) tools instead, when the state is self contained to the component's life cycle. But now and then I still need to alter the store state, but have this logic only happen while the component is still mounted. That's why I created this lib.

## How?

`redux-transient` provides a Redux store enhancer that will listen for specific action for adding and removing new reducers. It will keep an array with the store's original reducer and the temporary ones. On every new action, the enhancer will execute the original reducer as always, but then pass it's returned state to each temporary reducer one after the other, effectively *reducing* the state once more.

To facilitate it's usage with React, which was my original need, `redux-transient` also provides a Higher-Order component to attach a transient reducers during a React component's life cycle - meaning it will attach when mounting, and detach when unmounting.

## Install

`yarn add redux-transient`

> Or, good ol' `npm install --save redux-transient`

## Usage

### Simple as can

```js
import { createStore } from 'redux'
import { enhancer, addReducer } from 'redux-transient'

// Basic reducers to 'increase' and 'decrease' a numeric state.
const increaseReducer = (state, { type }) => type === 'increase' ? ++state : state
const decreaseReducer = (state, { type }) => type === 'decrease' ? --state : state

const store = createStore(increaseReducer, 0, enhancer)

store.dispatch({ type: 'increase' })
store.getState() // 1

// Dispatch an unhandled 'decrease' action.
store.dispatch({ type: 'decrease' })
store.getState() // 1

store.dispatch(addReducer(decreaseReducer))

store.dispatch({ type: 'decrease' })
store.getState() // 0
```

### With React

***Keep in mind that usage with React requires `react-redux` and `react` to be installed. Therefore, you must include the Higher-Order component from the "lib/withReducer", not the project's root***

Initiate your React app as usual, but adding the transient enhancer to the store:

```js
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { enhancer } from 'redux-transient'

import reducers from './reducers'
import MyComponent from './MyComponent'

const store = createStore(reducers, 0, enhancer)

const App = () => (
  <Provider store={ store }>
    <MyComponent />
  </Provider>
)

// ... init React.
```

On your component, connect a transient reducer as such:

```js
import React from 'react'
import { withReducer } from 'redux-transient/lib/withReducer'

const MyComponent = () => <p>My component content.</p>

const reducer = (state, action) => {
  // ... reducer logic.
}

export default withReducer(reducer)(MyComponent)
```

## License

Copyright (c) 2017 Lucas Constantino Silva

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
