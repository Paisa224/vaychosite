import { Router } from 'express'
import { leadsRouter } from './leads.routes'

export const apiRouter = Router()

apiRouter.get('/health', (_request, response) => {
  response.json({ status: 'ok' })
})

apiRouter.use('/', leadsRouter)
