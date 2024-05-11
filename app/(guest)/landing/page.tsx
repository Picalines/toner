import { Suspense } from 'react'
import ThemeToggle from '@/components/theme-toggle'
import LandingLogo from './landing-logo'
import SignInOrReturn from './sign-in-or-return'

export default function LandingPage() {
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
				<LandingLogo />
			</div>
		</main>
	)
}
