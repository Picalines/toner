import { User } from 'lucia'
import { EllipsisIcon, KeyRoundIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { authenticateOrRedirect } from '@/lib/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import UserAvatar from '@/components/user-avatar'

export default async function AccountPage() {
	const { user } = await authenticateOrRedirect('/sign-in')

	return (
		<div className="p-2">
			<PageHeader {...user} />
			<Separator className="mb-2 mt-2" />
		</div>
	)
}

function PageHeader({ login, displayName }: User) {
	return (
		<div className="flex flex-row items-center p-2">
			<div className="flex flex-row items-center gap-2">
				<UserAvatar
					login={login}
					displayName={displayName}
					className="h-16 w-16 text-3xl"
				/>
				<span>
					{login == displayName ? (
						<>@{login}</>
					) : (
						<>
							{displayName} @{login}
						</>
					)}
				</span>
			</div>
			<div className="flex-grow" />
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline" className="p-2">
						<EllipsisIcon />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-min p-2">
					<Link
						href="/account/profile"
						className={buttonVariants({
							variant: 'ghost',
							className: 'w-full space-x-2',
						})}
					>
						<UserIcon />
						<span>Edit Profile</span>
					</Link>
					<Link
						href="/account/password"
						className={buttonVariants({
							variant: 'ghost',
							className: 'w-full space-x-2',
						})}
					>
						<KeyRoundIcon />
						<span>Change Password</span>
					</Link>
				</PopoverContent>
			</Popover>
		</div>
	)
}
