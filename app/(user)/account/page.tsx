import { LogOut, Pencil } from 'lucide-react'
import { ComponentProps } from 'react'
import { authenticateOrRedirect } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import UserAvatar from '@/components/user-avatar'
import { signOut } from '@/actions/auth/sign-out'

export default async function AccountPage() {
	const {
		user: { login, displayName },
	} = await authenticateOrRedirect('/sign-in')

	return (
		<div className="p-2">
			<div className="w-min space-y-2">
				<div className="flex flex-row items-center gap-2 w-min">
					<UserAvatar
						login={login}
						displayName={displayName}
						className="w-16 h-16 text-3xl"
					/>
					<div className="flex flex-col gap-1">
						<span>{login}</span>
						<span className="text-gray-500">@{displayName}</span>
					</div>
				</div>
				<Button variant="outline" className="space-x-2 w-full">
					<Pencil width={16} />
					<span>Edit Profile</span>
				</Button>
			</div>
			<SignOut className="absolute right-4 bottom-4" />
		</div>
	)
}

function SignOut(formProps: ComponentProps<'form'>) {
	return (
		<form {...formProps} action={signOut}>
			<Button type="submit" variant="outline" className="space-x-2">
				<LogOut />
				<span>Sign Out</span>
			</Button>
		</form>
	)
}
