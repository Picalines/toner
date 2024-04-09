import Link from 'next/link'
import ThemeToggle from '@/components/theme-toggle'
import { buttonVariants } from '@/components/ui/button'

export default function LandingPage() {
	return (
		<main className="w-full">
			<div className="sticky top-0 bg-background p-2 border-b flex">
				<Link
					href="/sign-in"
					className={buttonVariants({ variant: 'outline' })}
				>
					Sign In
				</Link>
				<div className="inline flex-grow" />
				<ThemeToggle
					variant="outline"
					toggleVariant="iconOnly"
					className="p-2"
				/>
			</div>
		</main>
	)
}
