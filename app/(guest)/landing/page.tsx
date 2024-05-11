import Link from 'next/link'
import { Suspense } from 'react'
import { authenticate } from '@/lib/auth'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/theme-toggle'
import { buttonVariants } from '@/components/ui/button'
import LandingLogo from './landing-logo'
import SignInOrReturn from './sign-in-or-return'

export default async function LandingPage() {
	const signedIn = (await authenticate()) !== null

	return (
		<main className="w-full">
			<div className="sticky top-0 flex border-b bg-background p-2">
				<Suspense>
					<SignInOrReturn buttonVariant="outline" />
				</Suspense>
				<div className="inline flex-grow" />
				<ThemeToggle
					variant="outline"
					className="p-2"
					themeName={false}
				/>
			</div>
			<div className="relative h-[80vh]">
				<LandingLogo className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

				{signedIn ? null : (
					<Link
						href="/sign-up"
						className={cn(
							buttonVariants(),
							'absolute bottom-0 left-1/2 -translate-x-1/2 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary',
						)}
					>
						Sign up
					</Link>
				)}
			</div>
		</main>
	)
}
