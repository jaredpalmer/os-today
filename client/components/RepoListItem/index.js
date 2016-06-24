import React from 'react'
import s from './RepoListItem.css'

class RepoListItem extends React.Component {
  render () {
    const { repo } = this.props
    return (
      <div className={s.root}>
        <div>
          <img className={s.avatar} src={repo.owner.avatar_url} alt={repo.owner.login}/>
        </div>
        <div>
          <h3 className={s.full_name}><a href={repo.html_url} target='_blank'>{repo.full_name}</a></h3>
          <p className={s.description}>{repo.description}</p>
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
