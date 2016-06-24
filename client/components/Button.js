import React from 'react'

export default class Button extends React.Component {
  constructor () {
    super()
    this.state = {
      liked: 'false'
    }
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick () {
    this.setState({liked: 'blah'})
  }
  render () {
    return (
      <button onClick={this.handleClick}>
        {this.state.liked}
      </button>
    )
  }
}
