'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { signIn } from './actions'
import { SignInFormData, signInFormSchema } from './schemas'

export default function SignInForm(cardProps: ComponentProps<typeof Card>) {
	const form = useForm<SignInFormData>({
		resolver: zodResolver(signInFormSchema),
		defaultValues: {
			login: '',
			password: '',
		},
	})

	const {
		formState: { isSubmitting, isSubmitSuccessful },
	} = form

	const isInputDisabled = isSubmitting || isSubmitSuccessful

	const onSubmit = form.handleSubmit(async formData => {
		const { errors } = await signIn(formData)
		for (const { field, message } of errors) {
			form.setError(field, { message })
		}
	})

	return (
		<Form {...form}>
			<Card {...cardProps}>
				<form onSubmit={onSubmit}>
					<CardHeader>
						<CardTitle>Sign in</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
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
								name="password"
								render={({ field }) => (
									<FormItem className="space-y-1">
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												disabled={isInputDisabled}
												placeholder="password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							type="submit"
							disabled={isInputDisabled}
							className="w-full"
						>
							{isInputDisabled && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Sing in
						</Button>
					</CardFooter>
				</form>
			</Card>
		</Form>
	)
}
