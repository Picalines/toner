'use client'

import { signup } from './actions'
import { useFormState } from 'react-dom'

export default function LoginPage() {
	const [formState, signupAction] = useFormState(signup, {
		errorMessages: [],
	})

	return (
		<>
			<h1>Create an account</h1>
			<div className="w-full max-w-xs">
				<form
					className="bg-white rounded px-8 pt-6 pb-8 mb-4"
					action={signupAction}
				>
					<div className="mb-4">
						<label
							className="block text-gray-700 text-sm font-bold mb-2"
							htmlFor="login"
						>
							Login
						</label>
						<input
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							id="login"
							name="login"
							type="text"
							placeholder="login"
						/>
					</div>
					<div className="mb-6">
						<label
							className="block text-gray-700 text-sm font-bold mb-2"
							htmlFor="password"
						>
							Password
						</label>
						<input
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							id="password"
							name="password"
							type="password"
							placeholder="password"
						/>
					</div>
					<ul>
						{formState.errorMessages.map((message, i) => (
							<li key={i} className="text-red-500">{message}</li>
						))}
					</ul>
					<div className="flex items-center justify-between">
						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
							type="submit"
						>
							Sign Up
						</button>
					</div>
				</form>
			</div>
		</>
	)
}
