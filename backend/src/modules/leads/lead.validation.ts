import { z } from 'zod'

export const leadInputSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().regex(/^\+?[0-9\s-]{7,15}$/),
  email: z.string().email().max(150),
  service: z.enum([
    'construccion',
    'reformas-integrales',
    'electricidad',
    'fontaneria',
    'albanileria',
    'mantenimiento',
    'otro',
  ]),
  customService: z.string().max(120).optional(),
  details: z.string().min(10).max(1000),
}).superRefine((values, context) => {
  if (values.service === 'otro' && (!values.customService || values.customService.trim().length < 3)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['customService'],
      message: 'customService is required when service is otro',
    })
  }
})

export type LeadInput = z.infer<typeof leadInputSchema>
