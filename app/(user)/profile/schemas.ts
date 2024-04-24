import { z } from 'zod'
import { displayNameSchema, loginSchema } from '@/schemas/user'

export const editProfileSchema = z.object({
	login: loginSchema,
	displayName: displayNameSchema,
})

export type EditProfileFormData = z.infer<typeof editProfileSchema>
