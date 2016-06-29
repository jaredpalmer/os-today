import React from 'react'
import Link from 'react-router/lib/Link'
import IndexLink from 'react-router/lib/IndexLink'
import s from './Nav.css'

const Nav = () => (
  <div className={s.root}>
    <nav className={s.Links}>
      <Link className={s.LeftLink} to='/'>/home</Link>
      <Link className={s.LeftLink} to='/about'>/about</Link>
    </nav>
    <h1 className={s.Brand}><IndexLink className={s.BrandLink}to='/'> OS.today</IndexLink></h1>
    <div className={s.Links}>
      <a className={s.RightLink} href='/logout'>/logout</a>
    </div>
  </div>
)

export default Nav
