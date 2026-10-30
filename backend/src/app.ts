import cors from 'cors'
import express from 'express'
import { env } from './config/env'
import { errorHandler } from './middlewares/error.middleware'
import { apiRouter } from './routes'

export const app = express()

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
  }),
)
app.use(express.json())

app.use('/api', apiRouter)

app.use(errorHandler)
