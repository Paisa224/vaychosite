import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { createLeadHandler } from '../modules/leads/lead.controller'

export const leadsRouter = Router()

const leadSubmissionLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		message: 'Too many requests. Please try again in one minute.',
	},
})

leadsRouter.post('/leads', leadSubmissionLimiter, createLeadHandler)
