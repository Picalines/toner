'use server'

import { lucia, scrypt } from '@/lib/auth'
import { authorTable, database, listenerTable, userTable } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

type SignupFormState = { errorMessages: string[] }

const signupFormSchema = z.object({
	login: z
		.string()
		.min(5, 'login must contain at least 5 characters')
		.max(32, 'login must contain at most 32 characters')
		.regex(
			/^[a-z0-9_]+$/,
			'login must consist of only lowercase a-z characters, digits or an underscore',
		),
	password: z
		.string()
		.min(6, 'password must contain at least 6 characters')
		.max(100, 'password must contain at most 255 characters'),
})

export const signup = async (
	_: SignupFormState,
	formData: FormData,
): Promise<SignupFormState> => {
	const validationResult = signupFormSchema.safeParse({
		login: formData.get('login'),
		password: formData.get('password'),
	})

	if (!validationResult.success) {
		return {
			errorMessages: validationResult.error.issues.map(
				issue => issue.message,
			),
		}
	}

	const { login, password } = validationResult.data

	const hashedPassword = await scrypt.hash(password)

	const { insertedUserId } = await database.transaction(async t => {
		const existingUser = await t
			.select()
			.from(userTable)
			.where(eq(userTable.login, login))

		if (existingUser.length) {
			return { insertedUserId: null }
		}

		const [{ insertedUserId }] = await t
			.insert(userTable)
			.values({
				login,
				passwordHash: hashedPassword,
				displayName: login,
			})
			.returning({ insertedUserId: userTable.id })

		await t.insert(listenerTable).values({ userId: insertedUserId })
		await t.insert(authorTable).values({ userId: insertedUserId })

		return { insertedUserId }
	})

	if (insertedUserId === null) {
		return {
			errorMessages: [`user '${login}' already exists`],
		}
	}

	const session = await lucia.createSession(insertedUserId, {})

	const sessionCookie = lucia.createSessionCookie(session.id)
	cookies().set(
		sessionCookie.name,
		sessionCookie.value,
		sessionCookie.attributes,
	)

	redirect('/')
}
