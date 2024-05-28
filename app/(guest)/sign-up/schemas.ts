import { z } from 'zod'
import { userSchemas } from '@/lib/schemas/user'

export const signupFormSchema = z
	.object({
		login: userSchemas.login,
		password: userSchemas.password,
		confirmPassword: userSchemas.password,
	})
	.superRefine(({ password, confirmPassword }, { addIssue }) => {
		if (password !== confirmPassword) {
			addIssue({
				code: 'custom',
				path: ['confirmPassword'],
				message: 'password missmatch',
			})
		}
	})

export type SignupFormData = z.infer<typeof signupFormSchema>
