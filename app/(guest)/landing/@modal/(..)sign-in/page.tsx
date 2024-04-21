'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import SignInForm from '@/app/(guest)/sign-in/form'

export default function SignInModal() {
	const router = useRouter()

	const onOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				router.back()
			}
		},
		[router],
	)

	const onSignedIn = useCallback(() => {
		router.push('/account')
		router.refresh()
	}, [router])

	return (
		<Dialog defaultOpen onOpenChange={onOpenChange}>
			<DialogContent className="w-80 border-none bg-none p-0">
				<SignInForm onSignedIn={onSignedIn} className="w-full" />
			</DialogContent>
		</Dialog>
	)
}
