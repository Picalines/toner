import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function Home() {
	return (
		<main className="w-full">
			<Link
				href="/sign-in"
				className={buttonVariants({ variant: 'default' })}
			>
				Sign In
			</Link>
		</main>
	)
}
