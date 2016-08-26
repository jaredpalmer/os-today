/* global fetch */
import React from 'react'
import IndexLink from 'react-router/lib/IndexLink'
import s from './Nav.css'



class Nav extends React.Component {
  constructor () {
    super()
    this.refreshMyStars = this.refreshMyStars.bind(this)
  }
  refreshMyStars () {
    fetch('/api/v0/users/refresh/social', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(res => console.log(res))
  }
  render () {
    return (
      <div className={s.root}>
        <div style={{lineHeight: '50px', verticalAlign: 'middle'}}>
          <h1 className={s.Brand} style={{display: 'inline-block'}}><IndexLink className={s.BrandLink}to='/'> OS.today</IndexLink></h1>
          <button className={s.Refresh} onClick={this.refreshMyStars}>
            <svg style={{fill: '#ffffff', verticalAlign: 'text-bottom'}} xmlns='http://www.w3.org/2000/svg' width='12' height='16' viewBox='0 0 12 16'><path d='M10.24 7.4a4.15 4.15 0 0 1-1.2 3.6 4.346 4.346 0 0 1-5.41.54L4.8 10.4.5 9.8l.6 4.2 1.31-1.26c2.36 1.74 5.7 1.57 7.84-.54a5.876 5.876 0 0 0 1.74-4.46l-1.75-.34zM2.96 5a4.346 4.346 0 0 1 5.41-.54L7.2 5.6l4.3.6-.6-4.2-1.31 1.26c-2.36-1.74-5.7-1.57-7.85.54C.5 5.03-.06 6.65.01 8.26l1.75.35A4.17 4.17 0 0 1 2.96 5z' /></svg>
          </button>
        </div>
        <nav className={s.Links}>
          <a className={s.RightLink} href='/logout'>/logout</a>
        </nav>
      </div>
    )
  }
}

export default Nav
