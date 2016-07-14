const neo4j = require('neo4j-driver').v1
const URL = require('url')
const url = URL.parse(process.env.GRAPHENEDB_URL)
console.log(url)
const driver = neo4j.driver(`bolt://${url.host}`, neo4j.auth.basic(url.auth.split(':')[0], url.auth.split(':')[1]))
export default driver
