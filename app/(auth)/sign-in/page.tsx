import { redirect } from 'next/navigation'
import { authenticate } from '@/lib/auth'
import SignInForm from './form'

export default async function SignInPage() {
	const auth = await authenticate()
	if (auth) {
		redirect('/account')
	}

	return (
		<>
			<div className="w-full max-w-xs">
				<SignInForm />
			</div>
		</>
	)
}
