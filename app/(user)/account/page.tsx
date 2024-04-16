import { Pencil } from 'lucide-react'
import { authenticateOrRedirect } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import UserAvatar from '@/components/user-avatar'

export default async function AccountPage() {
	const {
		user: { login, displayName },
	} = await authenticateOrRedirect('/sign-in')

	return (
		<div className="p-2">
			<div className="w-min space-y-2">
				<div className="flex w-min flex-row items-center gap-2">
					<UserAvatar
						login={login}
						displayName={displayName}
						className="h-16 w-16 text-3xl"
					/>
					<div className="flex flex-col gap-1">
						<span>{login}</span>
						<span className="text-gray-500">@{displayName}</span>
					</div>
				</div>
				<Button variant="outline" className="w-full space-x-2">
					<Pencil width={16} />
					<span>Edit Profile</span>
				</Button>
			</div>
		</div>
	)
}
