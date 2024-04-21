'use server'

import { eq } from 'drizzle-orm'
import { authenticateOrRedirect } from '@/lib/auth'
import { accountTable, database } from '@/lib/db'
import { EditProfileFormData, editProfileSchema } from './schemas'

export type EditProfileActionResult = {
	errors: { field: keyof EditProfileFormData; message: string }[]
}

export const editProfile = async (
	formData: EditProfileFormData,
): Promise<EditProfileActionResult> => {
	const validationResult = editProfileSchema.safeParse(formData)

	if (!validationResult.success) {
		return {
			errors: validationResult.error.issues.map(issue => ({
				field: issue.path[0] as keyof EditProfileFormData,
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
					message: `login '${newLogin}' is already exists`,
				},
			],
		}
	}

	return {
		errors: [],
	}
}
