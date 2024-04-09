import { RedirectType, redirect } from 'next/navigation'
import { authenticate } from '@/lib/auth'

export default async function Home() {
	const signedIn = (await authenticate()) !== null

	redirect(signedIn ? '/account' : '/landing', RedirectType.replace)
}
