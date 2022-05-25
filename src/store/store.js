// const { createStore, applyMiddleware, combineReducers, compose } = Redux
// const thunk = ReduxThunk.default

import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import thunk from 'redux-thunk'

import { userReducer } from './user/user.reducer'
import { boardReducer } from './board/board.reducer'
// import {groupReducer} from './group/group.reducer'
// import {taskReducer} from './task/task.reducer'

const rootReducer = combineReducers({
    userModule: userReducer,
    boardModule: boardReducer,
    // groupModule: groupReducer,
    // taskModule: taskReducer
})


// export const store = createStore(rootReducer, applyMiddleware(thunk))
// window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__();
// Lets wire up thunk and also redux-dev-tools:
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)))
// export const store = createStore(rootReducer, applyMiddleware(thunk))
