import { z } from 'zod'
import { userSchemas } from '@/schemas/user'

export const signInFormSchema = z.object({
	login: userSchemas.login,
	password: userSchemas.password,
})

export type SignInFormData = z.infer<typeof signInFormSchema>
