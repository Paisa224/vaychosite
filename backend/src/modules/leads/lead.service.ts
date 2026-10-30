import { randomUUID } from 'node:crypto'
import { env } from '../../config/env'
import { getPrismaClient } from '../../lib/prisma'
import type { LeadRecord } from './lead.types'
import { notifyLead } from './lead.notification'
import type { LeadInput } from './lead.validation'

const inMemoryLeadStore: LeadRecord[] = []

export class LeadService {
  async createLead(input: LeadInput): Promise<LeadRecord> {
    await notifyLead(input)

    const baseLead = {
      id: randomUUID(),
      source: 'website' as const,
      createdAt: new Date().toISOString(),
      ...input,
    }

    if (env.LEAD_STORAGE_MODE === 'prisma') {
      const prisma = getPrismaClient()
      await prisma.createLead(input)

      const simulated = { ...baseLead, storage: 'prisma-simulated' as const }
      return simulated
    }

    const savedLead: LeadRecord = { ...baseLead, storage: 'memory' }
    inMemoryLeadStore.push(savedLead)

    return savedLead
  }
}

export const leadService = new LeadService()
