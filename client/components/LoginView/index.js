import React from 'react'
import s from './LoginView.css'

const LoginView = () => (
  <div className={s.root}>
    <h1>Login</h1>
    <a href='/auth/github' className={s.github}>Login with GitHub</a>
  </div>
)

export default LoginView
