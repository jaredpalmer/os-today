import React from 'react'
import s from './AboutView.css'
const AboutView = () => (
  <div className={s.root}>
  <h1 className={s.content}>OS.today</h1>

  <p className={s.content}>A list a of the GitHub repos you should be using.</p>

  <h2 className={s.content}>How it works</h2>

  <p className={s.content}>When you login to the app, it creates a graph of your starred repositories. Next, it finds all the users you follow and their stars. Finally, it calculates which projects your friends have starred but you haven't, and then sorts.</p>
  </div>
)

export default AboutView
