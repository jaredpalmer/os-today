import neo4j from 'neo4j'
import config from '../config'

const db = new neo4j.GraphDatabase({
  url: config.neo4jURL
  // auth: null  // optional; see below for more details
  // headers: {},    // optional defaults, e.g. User-Agent
  // proxy: null,    // optional URL
  // agent: null    // optional http.Agent instance, for custom socket pooling
})

export default db
