import { User } from 'lucia'
import { EllipsisIcon, KeyRoundIcon, LogOutIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { authenticateOrRedirect } from '@/lib/auth'
import { tw } from '@/lib/utils'
import SignOutDialog, {
	SignOutDialogTrigger,
} from '@/components/sign-out-dialog'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
	const linkClassName = tw`flex h-min w-full justify-start gap-2 p-2`

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
			<SignOutDialog>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="p-2">
							<EllipsisIcon />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Profile</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link
								href="/account/profile"
								className={linkClassName}
							>
								<UserIcon />
								<span>Edit Profile</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link
								href="/account/password"
								className={linkClassName}
							>
								<KeyRoundIcon />
								<span>Change Password</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<SignOutDialogTrigger asChild>
								<Button
									variant="ghost"
									className={linkClassName}
								>
									<LogOutIcon />
									<span>Sign out</span>
								</Button>
							</SignOutDialogTrigger>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SignOutDialog>
		</div>
	)
}
