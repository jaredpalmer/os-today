import db from '../server/models/db'

export const resetDB = (done) => {
  const session = db.session()
  session
    .run('MATCH (n) DETACH DELETE n')
    .then(result => {
      done()
      session.close()
    })
    .catch(e => {
      console.error(e)
      done()
    })
}
