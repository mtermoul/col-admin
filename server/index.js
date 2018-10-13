const restify = require('restify')
const pgRestify = require('pg-restify')
const corsMiddleware = require('restify-cors-middleware')

const PORT = 4000
const SERVER = 'localhost'
const DBPORT = 5432
const DBSERVER = 'localhost'
const DBNAME = 'col_admin'
const APIPATH = 'api/generic'
const server = restify.createServer()
const cors = corsMiddleware({
  origins: ['http://localhost:*'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
})
server.pre(cors.preflight)
server.use(cors.actual)

pgRestify.initialize(
    {
        server: server,
        pgConfig: {connectionString: `postgres://${DBSERVER}:${DBPORT}/${DBNAME}`}
    }, (err, pgRestifyInstance) => {
        if (err) throw err
        server.listen(PORT, () => console.log(`🚀 Server ready at http://${SERVER}:${PORT}/${APIPATH}`))
})
