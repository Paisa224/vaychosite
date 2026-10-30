import { app } from './app'
import { env } from './config/env'

app.listen(env.PORT, () => {
  console.info(`API ready on http://localhost:${env.PORT}`)
})
