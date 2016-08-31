/* global fetch */
import React from 'react'
import RepoList from '../components/RepoList'

class Feed extends React.Component {
  constructor () {
    super()
    this.state = {
      repos: [],
      page: 0,
      paging: false,
      done: false
    }
    this.checkWindowScroll = this.checkWindowScroll.bind(this)
    this.getPage = this.getPage.bind(this)
  }

  checkWindowScroll () {
    // Get scroll pos & window data
    const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    const s = document.body.scrollTop
    const scrolled = (h + s) + 300 > document.body.offsetHeight

    // If scrolled enough, not currently paging and not complete...
    if (scrolled && !this.state.paging && !this.state.done) {
      // Set application state (Paging, Increment page)
      this.setState({paging: true, page: this.state.page + 1})

      // Get the next page of repos from the server
      this.getPage(this.state.page)
    }
  }

  getPage (page) {
    fetch(`/api/v0/users/feed/${this.state.page}`, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(res => {
      if (res.length > 0) {
        const updatedRepos = this.state.repos
        res.forEach(repo => updatedRepos.push(repo))
        this.setState({ repos: updatedRepos, paging: false })
      } else {
        this.setState({ paging: false, done: true })
      }
    }).catch(e => {
      console.log(e)
      this.setState({ paging: false, done: true })
    })
  }

  componentDidMount () {
    window.addEventListener('scroll', this.checkWindowScroll)
    this.getPage(this.state.page)
  }

  render () {
    return (
      <div>
        {this.state.repos.length === 0 &&
          <div style={{margin: '1rem', fontWeight: '900', fontSize: '1.5rem'}}>Go star some stuff!</div>
        }
        {this.state.repos.length > 0 &&
          <RepoList repos={this.state.repos} />
        }
        {this.state.paging &&
          <div style={{margin: '1rem', fontWeight: '900', fontSize: '1.5rem'}}>Loading....</div>
        }
      </div>
    )
  }
}

export default Feed
