const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.GRAPHENEDB_URL || 'bolt://localhost')
export default driver
