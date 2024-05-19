'use server'

import { eq } from 'drizzle-orm'
import { authenticateOrRedirect } from '@/lib/auth'
import { accountTable, database } from '@/lib/db'
import { UpdateProfileFormData, profileUpdateSchema } from './schemas'

export type EditProfileActionResult = {
	errors: { field: keyof UpdateProfileFormData; message: string }[]
}

export async function updateProfile(
	formData: UpdateProfileFormData,
): Promise<EditProfileActionResult> {
	const validationResult = profileUpdateSchema.safeParse(formData)

	if (!validationResult.success) {
		return {
			errors: validationResult.error.issues.map(issue => ({
				field: issue.path[0] as keyof UpdateProfileFormData,
				message: issue.message,
			})),
		}
	}

	const {
		user: { id: accountId, login: oldLogin },
	} = await authenticateOrRedirect('/sign-in')

	const { login: newLogin, displayName: newDisplayName } =
		validationResult.data

	const success = await database.transaction(async tx => {
		if (oldLogin != newLogin) {
			const existingAccountQuery = await tx
				.select({
					accountId: accountTable.id,
				})
				.from(accountTable)
				.where(eq(accountTable.login, newLogin))

			if (existingAccountQuery.length) {
				return false
			}
		}

		await tx
			.update(accountTable)
			.set({
				login: newLogin,
				displayName: newDisplayName || newLogin,
			})
			.where(eq(accountTable.id, accountId))

		return true
	})

	if (!success) {
		return {
			errors: [
				{
					field: 'login',
					message: `login '${newLogin}' is already taken`,
				},
			],
		}
	}

	return {
		errors: [],
	}
}
