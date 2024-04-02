import { authenticateOrRedirect } from '@/lib/auth'

export default async function AccountPage() {
	const {
		user: { id: userId, login },
	} = await authenticateOrRedirect()

	return (
		<div>
			logged in as {login} (#{userId})!
		</div>
	)
}
