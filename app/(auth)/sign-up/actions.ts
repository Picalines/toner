'use server'

import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { lucia, scrypt } from '@/lib/auth'
import { accountTable, authorTable, database, listenerTable } from '@/lib/db'
import { SignupFormData, signupFormSchema } from './schemas'

export type SignupActionResult = {
	errors: { field: keyof SignupFormData; message: string }[]
}

export const signup = async (
	formData: SignupFormData,
): Promise<SignupActionResult | undefined> => {
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

	const { insertedAccountId } = await database.transaction(async t => {
		const existingAccount = await t
			.select()
			.from(accountTable)
			.where(eq(accountTable.login, login))

		if (existingAccount.length) {
			return { insertedAccountId: null }
		}

		const [{ insertedUserId: insertedAccountId }] = await t
			.insert(accountTable)
			.values({
				login,
				passwordHash: hashedPassword,
				displayName: login,
			})
			.returning({ insertedUserId: accountTable.id })

		await t.insert(listenerTable).values({ accountId: insertedAccountId })
		await t.insert(authorTable).values({ accountId: insertedAccountId })

		return { insertedAccountId }
	})

	if (insertedAccountId === null) {
		return {
			errors: [
				{
					field: 'login',
					message: `user '${login}' already exists`,
				},
			],
		}
	}

	const session = await lucia.createSession(insertedAccountId, {})

	const sessionCookie = lucia.createSessionCookie(session.id)
	cookies().set(
		sessionCookie.name,
		sessionCookie.value,
		sessionCookie.attributes,
	)

	redirect('/account')
}
