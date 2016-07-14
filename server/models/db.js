const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.GRAPHENEDB_URL || 'bolt://localhost', neo4j.auth.basic('neo4j', 'neo5j'))
export default driver
