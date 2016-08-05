import db from './db'
import fetch from 'isomorphic-fetch'

/**
 * Create a Repo node
 */
 export const findOrCreate = ({ id, name, description, avatar_url, full_name, url, html_url }, cb) => {
   if (!description) {
     const query = `
       MERGE (r:Repo { id: { id }, name: { name }, full_name: { full_name }, avatar_url: { avatar_url }, url: { url }, html_url: { html_url } })
       RETURN r
     `
     db.cypher({ query, params: { id, name, avatar_url, full_name, url, html_url }, lean: true }, (err, result) => {
       if (err) cb(err, null)
       cb(null, result[0].r)
     })
   } else {
     const query = `
       MERGE (r:Repo { id: { id }, name: { name }, description: { description }, full_name: { full_name }, avatar_url: { avatar_url }, url: { url }, html_url: { html_url } })
       RETURN r
     `
     db.cypher({ query, params: { id, name, description, avatar_url, full_name, url, html_url }, lean: true }, (err, result) => {
       if (err) cb(err, null)
       cb(null, result[0].r)
     })
   }


 }

/**
 * Star a repo
 */
export const star = (login, id, cb) => {
  const query = `
    MATCH (u:User { login: { login } }), (repo:Repo { id: { id } })
    MERGE (u)-[r:STARRED]->(repo)
    RETURN repo
  `
  db.cypher({ query, params: { login, id }, lean: true }, (err, result) => {
    if (err) cb(err, null)
    cb(null,result[0].repo)
  })
}

/**
 * Finds a user, finds or creates a GitHub Repo, and finally
 * creates an star relation between the two. If repo already exists, will attempt
 * to update stargazers count.
 * @param  {string}   login GitHub username
 * @param  {object}   repo  GitHub Repo
 * @param  {Function} cb    callback function that handles err repo
 */
export const findOrCreateRepoAndStar = (login, repo, cb) => {
  const query = `
    MATCH (u:User { login: { login } })
    MERGE (repo:Repo { id: { id } })
    ON CREATE SET repo.name = {name}, ${repo.description ? 'repo.description = {description}, ' : ''} repo.full_name = {full_name}, repo.avatar_url = {avatar_url}, repo.url = {url}, repo.html_url = {html_url}
    MERGE (u)-[r:STARRED]->(repo)
    RETURN repo
  `
  const { id, name, description, avatar_url, full_name, url, html_url } = repo
  db.cypher({ query, params: { login, id, name, description, avatar_url, full_name, url, html_url }, lean: true }, (err, result) => {
    if (err) cb(err, null)
    cb(null,result[0].repo)
  })
}
