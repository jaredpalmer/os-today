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
    fetch('/api/repos', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    })
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
