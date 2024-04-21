import { z } from 'zod'
import { loginSchema, passwordSchema } from '@/schemas/user'

export const signupFormSchema = z
	.object({
		login: loginSchema,
		password: passwordSchema,
		confirmPassword: z.string().min(1, 'required'),
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
