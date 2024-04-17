'use server'

import Link from 'next/link'
import { ComponentProps } from 'react'
import { authenticate } from '@/lib/auth'

export default async function SignInOrReturn(
	linkProps: Omit<ComponentProps<typeof Link>, 'href'>,
) {
	const signedIn = (await authenticate()) !== null

	// TODO: back link

	return (
		<Link {...linkProps} href="/sign-in" scroll={false}>
			Sign In
		</Link>
	)
}
