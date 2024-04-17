'use server'

import Link from 'next/link'
import { authenticate } from '@/lib/auth'
import { cn } from '@/lib/utils'
import BackButton from '@/components/back-button'
import { type ButtonProps, buttonVariants } from '@/components/ui/button'

type Props = Readonly<{
	buttonVariant: ButtonProps['variant']
	className?: string
}>

export default async function SignInOrReturn({
	buttonVariant,
	className,
}: Props) {
	const signedIn = (await authenticate()) !== null

	if (signedIn) {
		return <BackButton variant={buttonVariant} defaultHref="/account" />
	}

	return (
		<Link
			href="/sign-in"
			scroll={false}
			className={cn(
				className,
				buttonVariants({ variant: buttonVariant }),
			)}
		>
			Sign In
		</Link>
	)
}
