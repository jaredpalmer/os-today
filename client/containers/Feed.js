/* global fetch */
import React from 'react'
import {withRouter} from 'react-router'
import RepoList from '../components/RepoList'
import Button from '../components/Button'

class Feed extends React.Component {
  constructor () {
    super()
    this.state = {
      isLoading: false,
      repos: [],
      page: 0
    }
    this.loadRepos = this.loadRepos.bind(this)
  }

  componentDidMount () {
    this.setState({ isLoading: true, repos: [] })
    fetch(`/api/v0/users/feed/${this.state.page}`, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(res => this.setState({repos: res, isLoading: false}))
  }

  loadRepos () {
    this.setState({ isLoading: true, repos: [] })
    fetch(`/api/v0/users/feed/${this.state.page + 1}`, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(res => this.setState({ repos: res, isLoading: false, page: this.state.page + 1 }))
  }

  render () {
    return (
      <div>
        {this.state.isLoading &&
          <div style={{margin: '1rem', fontWeight: '900', fontSize: '1.5rem'}}>Loading....</div>
        }
        {!this.state.isLoading && !this.state.repos.length > 0 &&
          <div style={{margin: '1rem', fontWeight: '900', fontSize: '1.5rem'}}>Go star some stuff!</div>
        }
        {!this.state.isLoading && this.state.repos.length > 0 &&
          <RepoList repos={this.state.repos} />
        }
        <div style={{margin: '0 auto 4rem', padding: '0 1rem'}}>
          <Button onClick={this.loadRepos}>Next</Button>
        </div>
      </div>
    )
  }
}

export default withRouter(Feed)
