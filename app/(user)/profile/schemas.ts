import { z } from 'zod'
import { userSchemas } from '@/schemas/user'

export const profileUpdateSchema = z.object({
	login: userSchemas.login,
	displayName: userSchemas.displayName,
})

export type UpdateProfileFormData = z.infer<typeof profileUpdateSchema>
