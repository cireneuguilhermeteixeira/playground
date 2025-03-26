import Fastify from 'fastify'
import db from './plugins/db'
import { userRoutes } from './routes/users'

const app = Fastify()

app.register(db)
app.register(userRoutes)

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
