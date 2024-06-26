'use client'

import { type ComponentProps, type MouseEventHandler, useCallback } from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { signOut } from './sign-out'

type Props = Exclude<ComponentProps<typeof AlertDialog>, 'open'>

export default function SignOutDialog({ ...restProps }: Props) {
	const onActionClick = useCallback<MouseEventHandler>(async event => {
		event.preventDefault()
		await signOut() // TODO: add error handing?
	}, [])

	return (
		<AlertDialog {...restProps}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Sign out</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to sign out?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						asChild
						className={buttonVariants({ variant: 'destructive' })}
					>
						<Button onClick={onActionClick}>Sign out</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
