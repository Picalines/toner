'use server'

import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { lucia, scrypt } from '@/lib/auth'
import { accountTable, database } from '@/lib/db'
import { SignInFormData, signInFormSchema } from './schemas'

export type SignInActionResult = {
	errors: { field: keyof SignInFormData; message: string }[]
}

const authenticationError: SignInActionResult = {
	errors: [
		{ field: 'login', message: 'invalid login or password' },
		{ field: 'password', message: 'invalid login or password' },
	],
}

export async function signIn(
	formData: SignInFormData,
): Promise<SignInActionResult> {
	const validationResult = signInFormSchema.safeParse(formData)

	if (!validationResult.success) {
		return {
			errors: validationResult.error.issues.map(issue => ({
				field: issue.path[0] as keyof SignInFormData,
				message: issue.message,
			})),
		}
	}

	const { login, password } = validationResult.data

	const existingAccountQuery = await database
		.select({
			accountId: accountTable.id,
			passwordHash: accountTable.passwordHash,
		})
		.from(accountTable)
		.where(eq(accountTable.login, login))

	if (!existingAccountQuery.length) {
		return authenticationError
	}

	const [{ accountId, passwordHash }] = existingAccountQuery

	const isPasswordValid = await scrypt.verify(passwordHash, password)
	if (!isPasswordValid) {
		return authenticationError
	}

	const session = await lucia.createSession(accountId, {})

	const sessionCookie = lucia.createSessionCookie(session.id)
	cookies().set(
		sessionCookie.name,
		sessionCookie.value,
		sessionCookie.attributes,
	)

	return {
		errors: [],
	}
}
