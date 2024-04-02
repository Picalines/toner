import { Button } from '@/components/ui/button'
import { signOut } from './actions'

export default function SignOutForm() {
	return (
		<form action={signOut}>
			<Button type="submit">Sign Out</Button>
		</form>
	)
}
