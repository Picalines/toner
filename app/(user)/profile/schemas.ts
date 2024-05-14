import { z } from 'zod'
import { userSchemas } from '@/schemas/user'

export const editProfileSchema = z.object({
	login: userSchemas.login,
	displayName: userSchemas.displayName,
})

export type EditProfileFormData = z.infer<typeof editProfileSchema>
