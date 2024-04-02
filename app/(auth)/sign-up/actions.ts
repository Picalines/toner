'use server'

import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { lucia, scrypt } from '@/lib/auth'
import { authorTable, database, listenerTable, userTable } from '@/lib/db'
import { SignupFormData, signupFormSchema } from './schemas'

export type SignupActionResult = {
	errors: { field: keyof SignupFormData; message: string }[]
}

export const signup = async (
	formData: SignupFormData,
): Promise<SignupActionResult> => {
	const validationResult = signupFormSchema.safeParse(formData)

	if (!validationResult.success) {
		return {
			errors: validationResult.error.issues.map(issue => ({
				field: issue.path[0] as keyof SignupFormData,
				message: issue.message,
			})),
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
			errors: [
				{
					field: 'login',
					message: `user '${login}' already exists`,
				},
			],
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
