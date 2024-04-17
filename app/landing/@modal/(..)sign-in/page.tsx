'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import SignInForm from '@/app/(auth)/sign-in/form'

export default function SignInModal() {
	const router = useRouter()

	const onOpenChange = (open: boolean) => {
		if (!open) {
			router.back()
		}
	}

	return (
		<Dialog defaultOpen onOpenChange={onOpenChange}>
			<DialogContent className="border-none p-0">
				<SignInForm />
			</DialogContent>
		</Dialog>
	)
}
