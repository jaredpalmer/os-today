import React from 'react'
import IndexLink from 'react-router/lib/IndexLink'
import s from './Nav.css'

const Nav = () => (
  <div className={s.root}>
    <h1 className={s.Brand}><IndexLink className={s.BrandLink}to='/'> OS.today</IndexLink></h1>
    <nav className={s.Links}>
      <a className={s.RightLink} href='/logout'>/logout</a>
    </nav>
  </div>
)

export default Nav
