import { z } from 'zod'

export const signupFormSchema = z
	.object({
		login: z
			.string()
			.min(5, 'must contain at least 5 characters')
			.max(32, 'must contain at most 32 characters')
			.regex(
				/^[a-z0-9_]+$/,
				'must consist of only lowercase a-z characters, digits or an underscore',
			),
		password: z
			.string()
			.min(6, 'must contain at least 6 characters')
			.max(100, 'must contain at most 255 characters'),
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
