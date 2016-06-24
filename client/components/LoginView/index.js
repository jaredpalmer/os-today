import React from 'react'
import s from './LoginView.css'

const LoginView = () => (
  <div className={s.root}>
    <h1>Login</h1>
    <button className={s.github}>Login with GitHub</button>
  </div>
)

export default LoginView
