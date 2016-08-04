import db from './db'
import fetch from 'isomorphic-fetch'

/**
 * Create a Repo node
 */
 export const findOrCreate = ({ id, name, url, html_url }, cb) => {
   const query = `
     MERGE (r:Repo { id: { id }, name: { name }, url: { url }, html_url: { html_url } })
     RETURN r
   `
   db.cypher({ query, params: { id, name, url, html_url }, lean: true }, (err, result) => {
     if (err) cb(err, null)
     cb(null, result[0].r)
   })
 }

/**
 * Star a repo
 */
export const star = (login, { id, name, url, html_url }, cb) => {
  const query = `
    MATCH (u:User { login: { login } }), (repo:Repo { id: { id }, name: { name }, url: { url }, html_url: { html_url } })
    MERGE (u)-[r:STARRED]->(repo)
    RETURN repo
  `
  db.cypher({ query, params: { login, id, name, url, html_url }, lean: true }, (err, result) => {
    if (err) cb(err, null)
    cb(null,result[0].repo)
  })
}
