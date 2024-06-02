'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { User } from 'lucia'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import UserAvatar from '@/components/user-avatar'
import { profileUpdateSchema } from './schemas'
import { updateProfile } from './update-profile'

type Props = Readonly<User>

const preventDefault = (event: Event) => event.preventDefault()

export default function EditProfileForm({ login, displayName }: Props) {
	const router = useRouter()

	const form = useForm({
		resolver: zodResolver(profileUpdateSchema),
		defaultValues: {
			login,
			displayName,
		},
	})

	const {
		formState: { isSubmitting, isSubmitSuccessful, isDirty },
	} = form

	const isInputDisabled = isSubmitting || isSubmitSuccessful

	const onSubmit = form.handleSubmit(async formData => {
		const { errors } = await updateProfile(formData)
		for (const { field, message } of errors) {
			form.setError(field, { message })
		}
		if (!errors.length) {
			router.replace('/account')
			router.refresh()
		}
	})

	const onCancelClick = useCallback(() => form.reset(), [form])

	return (
		<Form {...form}>
			<form onSubmit={onSubmit} className="flex flex-wrap gap-4">
				<div className="flex-grow space-y-4 p-2">
					<FormField
						control={form.control}
						name="login"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<FormLabel>Login</FormLabel>
								<FormControl>
									<Input
										disabled={isInputDisabled}
										placeholder="login"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="displayName"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<FormLabel>Display name</FormLabel>
								<FormControl>
									<Input
										disabled={isInputDisabled}
										placeholder="display name"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Popover open={isDirty}>
						<PopoverTrigger asChild>
							<span className="absolute bottom-2 left-1/2" />
						</PopoverTrigger>
						<PopoverContent
							className="flex h-min w-min justify-center gap-2 border-none p-2"
							side="top"
							onOpenAutoFocus={preventDefault}
						>
							<Button
								type="button"
								variant="secondary"
								disabled={isInputDisabled}
								onClick={onCancelClick}
							>
								Cancel
							</Button>
							<Button
								type="button"
								className="w-min"
								disabled={isInputDisabled || !isDirty}
								onClick={onSubmit}
							>
								{isInputDisabled && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Update profile
							</Button>
						</PopoverContent>
					</Popover>
				</div>
				<div className="max-w-40 flex-grow p-2">
					<div className="space-y-1">
						<FormLabel>Profile picture</FormLabel>
						{/* TODO avatar uploading */}
						<UserAvatar
							login={login}
							displayName={displayName}
							className="aspect-square w-full text-3xl"
						/>
					</div>
				</div>
			</form>
		</Form>
	)
}
