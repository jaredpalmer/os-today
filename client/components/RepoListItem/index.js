import React from 'react'
import { load, parse } from 'gh-emoji'
import s from './RepoListItem.css'

class RepoListItem extends React.Component {
  constructor() {
    super()
    this.state = {
      desc: ''
    }
  }

  componentDidMount () {
    load().then(() => this.setState({desc: parse(this.props.repo.description)}))
  }

  render () {
    const { repo } = this.props
    return (
      <div className={s.root}>
        <div>
          <img className={s.avatar} src={repo.owner.avatar_url} alt={repo.owner.login}/>
        </div>
        <div>
          <h3 className={s.full_name}>{repo.full_name}</h3>
          <div className={s.description} dangerouslySetInnerHTML={{ __html: this.state.desc }} />
        </div>
        <div className={s.stargazers_count}>{repo.stargazers_count}</div>
      </div>
    )
  }
}

// const RepoListItem = ({ repo }) => (
//   <div className={s.root}>
//     <div>
//       <img className={s.avatar} src={repo.owner.avatar_url} alt={repo.owner.login}/>
//     </div>
//     <div>
//       <h3 className={s.full_name}>{repo.full_name}</h3>
//       <p className={s.description}>{}</p>
//     </div>
//     <div className={s.stargazers_count}>{repo.stargazers_count}</div>
//   </div>
// )

export default RepoListItem
