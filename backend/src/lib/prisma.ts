export interface PrismaClientAdapter {
  createLead: (payload: {
    name: string
    phone: string
    email: string
    service: string
    details: string
  }) => Promise<void>
}

export function getPrismaClient(): PrismaClientAdapter {
  // This adapter intentionally simulates persistence for the initial scaffold.
  return {
    async createLead(payload) {
      console.info('[PRISMA_ADAPTER_SIMULATION]', payload)
    },
  }
}
