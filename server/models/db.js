const neo4j = require('neo4j')

const db = new neo4j.GraphDatabase({
  url: process.env.GRAPHENEDB_URL || 'http://neo4j:neo5j@localhost:7474',
  // auth: null  // optional; see below for more details
  // headers: {},    // optional defaults, e.g. User-Agent
  // proxy: null,    // optional URL
  // agent: null    // optional http.Agent instance, for custom socket pooling
})

export default db
