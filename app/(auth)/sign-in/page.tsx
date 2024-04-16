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
		<div className="flex h-svh w-full items-center justify-center">
			<div className="flex w-80 flex-col items-center justify-center gap-4">
				<SignInForm className="w-full" />
				<div
					className="flex w-9/12 flex-row items-center justify-center gap-4 text-gray-600"
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
