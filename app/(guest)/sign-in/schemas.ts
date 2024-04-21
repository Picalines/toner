import { z } from 'zod'
import { loginSchema, passwordSchema } from '@/schemas/user'

export const signInFormSchema = z.object({
	login: loginSchema,
	password: passwordSchema,
})

export type SignInFormData = z.infer<typeof signInFormSchema>
