import {
	EllipsisIcon,
	KeyRoundIcon,
	LogOutIcon,
	PencilIcon,
} from 'lucide-react'
import Link from 'next/link'
import type { PropsWithChildren } from 'react'
import { cn, tw } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import UserAvatar from '@/components/user-avatar'

type Props = Readonly<{
	login: string
	displayName: string
	className?: string
}>

export default function ProfileSection({
	login,
	displayName,
	className,
}: Props) {
	return (
		<div className={cn('flex flex-row items-center p-2', className)}>
			<div className="flex flex-row items-center gap-2">
				<UserAvatar
					login={login}
					displayName={displayName}
					className="h-16 text-2xl"
				/>

				{login == displayName ? (
					<span>@{login}</span>
				) : (
					<div className="flex flex-col">
						<span>{displayName}</span>
						<span>@{login}</span>
					</div>
				)}
			</div>
			<div className="flex-grow" />
			<ProfileDropdownMenu>
				<Button variant="outline" className="p-2">
					<EllipsisIcon />
				</Button>
			</ProfileDropdownMenu>
		</div>
	)
}

function ProfileDropdownMenu({ children }: PropsWithChildren) {
	const linkClassName = tw`flex h-min w-full cursor-pointer justify-start gap-2 p-2`

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Profile</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/profile" className={linkClassName}>
						<PencilIcon />
						<span>Edit Profile</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/account/password" className={linkClassName}>
						<KeyRoundIcon />
						<span>Change Password</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link
						href="/sign-out"
						scroll={false}
						className={linkClassName}
					>
						<LogOutIcon />
						<span>Sign out</span>
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
