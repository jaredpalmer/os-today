export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'

export default (state, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return state
    default:
      return state
  }
}
