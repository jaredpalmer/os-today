import React from 'react'
import RepoListItem from '../RepoListItem'
import s from './RepoList.css'

const RepoList = ({ repos }) => (
  <div className={s.root}>
    {repos.map((repo) => <RepoListItem repo={repo} key={repo.repo.id} />)}
  </div>
)

export default RepoList
