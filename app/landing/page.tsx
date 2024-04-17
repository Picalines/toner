import { Suspense } from 'react'
import ThemeToggle from '@/components/theme-toggle'
import LandingContent from './landing-content'
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
					toggleVariant="iconOnly"
					className="p-2"
				/>
			</div>
			<div className="relative h-[80vh]">
				<LandingContent />
			</div>
		</main>
	)
}
