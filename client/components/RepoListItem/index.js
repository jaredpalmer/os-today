import React from 'react'
import s from './RepoListItem.css'

const RepoListItem = ({ repo }) => (
  <div className={s.Root}>
    <div>
      <img className={s.Avatar} src={repo.repo.avatar_url} alt={repo.repo.name} />
    </div>
    <div>
      <h3 className={s.RepoName}><a className={s.RepoNameLink} href={repo.repo.html_url} target='_blank'>{repo.repo.full_name}</a></h3>
      <div className={s.Description}>{repo.repo.description}</div>
      <div>
        <svg className={s.StarIcon} width='13' height='15' viewBox='0 0 14 16'><path d='M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74z' /></svg>
        <span className={s.StarCount}>{repo.likes}</span>
      </div>
    </div>
  </div>
)

export default RepoListItem
