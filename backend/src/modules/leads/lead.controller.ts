import type { Request, Response } from 'express'
import { leadService } from './lead.service'
import { leadInputSchema } from './lead.validation'

function hasFilledHoneypot(body: unknown): boolean {
  if (!body || typeof body !== 'object') {
    return false
  }

  const maybeWebsite = (body as { website?: unknown }).website

  return typeof maybeWebsite === 'string' && maybeWebsite.trim().length > 0
}

export async function createLeadHandler(
  request: Request,
  response: Response,
): Promise<void> {
  if (hasFilledHoneypot(request.body)) {
    response.status(204).end()
    return
  }

  const parseResult = leadInputSchema.safeParse(request.body)

  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors

    response.status(400).json({
      message: 'Validation error',
      errors: fieldErrors,
    })

    return
  }

  const lead = await leadService.createLead(parseResult.data)

  response.status(201).json({
    message: 'Lead captured successfully',
    lead,
  })
}
