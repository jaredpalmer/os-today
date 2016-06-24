/* global fetch */
import React from 'react'
import RepoList from '../components/RepoList'

class Feed extends React.Component {
  constructor () {
    super()
    this.state = {
      repos: []
    }
  }

  componentDidMount () {
    fetch('https://api.github.com/users/jaredpalmer/starred')
    .then(res => res.json())
    .then(res => this.setState({repos: res}))
  }

  render () {
    return (
      <div>
        <RepoList repos={this.state.repos} />
      </div>
    )
  }
}

export default Feed
