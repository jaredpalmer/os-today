import React, { PropTypes } from 'react'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import App from './App'
import LoginView from '../components/LoginView'
import NotFoundView from '../components/NotFoundView'
import Feed from './Feed'
import { UserAuthWrapper } from 'redux-auth-wrapper'

const UserIsAuthenticated = UserAuthWrapper({
  authSelector: state => state.user,
  wrapperDisplayName: 'UserIsAuthenticated'
})
/**
 * Root is exported for conditional usage index.js.
 * It's not 'real' a container, BUT it's special because it enables us to use
 * vanilla Webpack HMR.
 */
const Root = ({ store }) => (
  <Provider store={store}>
    <Router history={browserHistory}>
      {/* 'App' acts as a wrapper for the child components */}
      <Route path='login' component={LoginView} />
      <Route path='/' component={App}>
        {/* IndexRoute is the initial component that is loaded,
            other routes are loaded according to the component
            property specified here */}
        <IndexRoute component={UserIsAuthenticated(Feed)} />
        {/* <Route path='about' component={AboutView} /> */}
      </Route>
      <Route path='*' component={NotFoundView} />
    </Router>
  </Provider>
)

Root.propTypes = {
  store: PropTypes.object.isRequired
}

export default Root
