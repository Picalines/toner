'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import SignOutDialog from './dialog'

export default function SignOutModal() {
	const router = useRouter()

	const onOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				router.back()
			}
		},
		[router],
	)

	return <SignOutDialog defaultOpen onOpenChange={onOpenChange} />
}
