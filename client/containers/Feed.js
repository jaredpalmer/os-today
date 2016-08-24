/* global fetch */
import React from 'react'
import RepoList from '../components/RepoList'
import {withRouter} from 'react-router'

class Feed extends React.Component {
  constructor () {
    super()
    this.state = {
      isLoading: false,
      repos: [],
      page: 0
    }
    this.loadRepos = this.loadRepos.bind(this)
    this.refreshMyStars = this.refreshMyStars.bind(this)
  }

  componentDidMount () {
    this.setState({ isLoading: true, repos: [] })
    fetch(`/api/feed/${this.state.page}`, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(res => this.setState({repos: res, isLoading: false}))
  }

  loadRepos () {
    this.setState({ isLoading: true, repos: [] })
    fetch(`/api/feed/${this.state.page + 1}`, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(res => this.setState({ repos: res, isLoading: false, page: this.state.page + 1 }))
  }

  refreshMyStars () {
    fetch('/api/refresh', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(res => console.log(res))
  }

  render () {
    return (
      <div>
        <button onClick={this.refreshMyStars}>Refresh</button>
        {this.state.isLoading &&
          <div style={{margin: '1rem', fontWeight: '900', fontSize: '1.5rem'}}>Loading....</div>
        }
        {!this.state.isLoading && !this.state.repos.length > 0 &&
          <div style={{margin: '1rem', fontWeight: '900', fontSize: '1.5rem'}}>Go star some stuff!</div>
        }
        {!this.state.isLoading && this.state.repos.length > 0 &&
          <RepoList repos={this.state.repos} />
        }
        <button onClick={this.loadRepos}>Next</button>
      </div>
    )
  }
}

export default withRouter(Feed)
