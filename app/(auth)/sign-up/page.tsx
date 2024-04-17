import { redirect } from 'next/navigation'
import { authenticate } from '@/lib/auth'
import SignUpForm from './form'

export default async function SignUpPage() {
	const auth = await authenticate()
	if (auth) {
		redirect('/account')
	}

	return (
		<div className="flex h-svh w-full items-center justify-center">
			<div className="w-80">
				<SignUpForm />
			</div>
		</div>
	)
}
