import db from './db'

/**
 * Create a User node
 */
export const create = (options) => {
  const session = db.session()
  const q = `
    CREATE (r:Repo { options })
    RETURN r
  `
  return session
    .run(q, { options })
    .then(result => {
      session.close()
      return result.records[0].get('r').properties
    })
}

/**
 * Star a repo
 */
export const star = (username, repoId) => {
  const session = db.session()
  const q = `
    MATCH (u:User { login: { username } }), (repo:Repo { id: { repoId  } })
    MERGE (u)-[r:STARRED]->(repo)
  `
  return session
    .run(q, { username, repoId })
    .then((result) => {
      // session.close()
      return result
    })
}
