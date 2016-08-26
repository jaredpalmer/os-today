import neo4j from 'neo4j'

const db = new neo4j.GraphDatabase({
  url: process.env.GRAPHENEDB_URL || 'http://neo4j:neo5j@localhost:7474'
})

export const resetDB = (done) => {
  const query = 'MATCH (n) DETACH DELETE n'
  db.cypher({ query }, (err, result) => {
    if (err) done(err)
    done()
  })
}
