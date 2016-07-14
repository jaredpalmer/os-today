import db from './db'

export const create = (options, cb) => {
  const query = `
    CREATE (u:User { options })
    RETURN u
  `
  db.cypher({ query, params: options, lean: true }, (err, result) => {
    if (err) throw cb(err)
    cb(null, result[0].u)
  })
}



export const findByUsername = (login, cb) => {
  const query = `
    MATCH (u:User { login: { login }})
    RETURN u
  `
  db.cypher({ query, params: { login }, lean: true }, (err, result) => {
    if (err) throw cb(err)
    cb(null, result[0].u)
  })
}

export const findById = (id, cb) => {
  const query = `
    MATCH (u:User { id: { id }})
    RETURN u
  `
  db.cypher({ query, params: { id }, lean: true }, (err, result) => {
    if (err) throw cb(err)
    cb(null, result[0].u)
  })
}

export const findOrCreate = ({ login }, cb) => {
  const query = `
    MERGE (u:User { login: { login }})
    RETURN u
  `
  db.cypher({ query, params: { login }, lean: true }, (err, result) => {
    if (err) throw cb(err)
    cb(null, result[0].u)
  })
}
