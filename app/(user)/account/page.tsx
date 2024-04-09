import { LogOut } from 'lucide-react'
import { authenticateOrRedirect } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { signOut } from '@/actions/auth/sign-out'

export default async function AccountPage() {
	const {
		user: { id: userId, login },
	} = await authenticateOrRedirect('/sign-in')

	return (
		<div>
			logged in as {login} (#{userId})!
			<form action={signOut}>
				<Button type="submit">
					<LogOut />
					<span>Sign Out</span>
				</Button>
			</form>
		</div>
	)
}
