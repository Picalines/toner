'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
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
import { signup } from './actions'
import { SignupFormData, signupFormSchema } from './schemas'

export default function SignUpForm() {
	const [isPending, setPending] = useState(false)

	const form = useForm<SignupFormData>({
		resolver: zodResolver(signupFormSchema),
		defaultValues: {
			login: '',
			password: '',
		},
	})

	const onSubmit = form.handleSubmit(async formData => {
		try {
			setPending(true)
			const { errors } = (await signup(formData)) ?? { errors: [] }
			for (const { field, message } of errors) {
				form.setError(field, { message })
			}
		} finally {
			setPending(false)
		}
	})

	return (
		<Form {...form}>
			<Card>
				<form onSubmit={onSubmit}>
					<CardHeader>
						<CardTitle>Create an Accout</CardTitle>
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
												disabled={isPending}
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
												disabled={isPending}
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
							disabled={isPending}
							className="w-full"
						>
							{isPending && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Sing up
						</Button>
					</CardFooter>
				</form>
			</Card>
		</Form>
	)
}
