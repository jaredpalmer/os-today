/* global fetch */
import React from 'react'
import RepoList from '../components/RepoList'

class Feed extends React.Component {
  constructor () {
    super()
    this.state = {
      isLoading: false,
      repos: []
    }
  }

  componentDidMount () {
    this.setState({ isLoading: true, repos: [] })
    fetch(`/api/feed`, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(res => this.setState({repos: res, isLoading: false}))
  }

  render () {
    return (
      <div>
        {this.state.isLoading
          ? <div style={{margin: '1rem', fontWeight: '900', fontSize: '1.5rem'}}>Loading....</div>
          : <RepoList repos={this.state.repos} />}
      </div>
    )
  }
}

export default Feed
