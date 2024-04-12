import Link from 'next/link'
import { redirect } from 'next/navigation'
import { authenticate } from '@/lib/auth'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import SignInForm from './form'

export default async function SignInPage() {
	const auth = await authenticate()
	if (auth) {
		redirect('/account')
	}

	return (
		<div className="w-full h-svh flex items-center justify-center">
			<div className="w-80 flex flex-col items-center justify-center gap-4">
				<SignInForm className="w-full" />
				<div
					className="flex flex-row items-center justify-center gap-4 w-9/12 text-muted"
					aria-hidden
				>
					<Separator className="flex-1" />
					OR
					<Separator className="flex-1" />
				</div>
				<Link
					href="/sign-up"
					className={buttonVariants({
						variant: 'outline',
						className: 'w-full',
					})}
				>
					Create an Account
				</Link>
			</div>
		</div>
	)
}
