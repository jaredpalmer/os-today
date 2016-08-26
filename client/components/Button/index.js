import React from 'react'
import s from './Button.css'
const Button = ({onClick, children, ...rest}) => (
  <button className={s.root} onClick={onClick} {...rest}>{children}</button>
)

export default Button
