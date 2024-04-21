'use client'

import { AvatarImage } from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from './ui/avatar'

type Props = Readonly<{
	login: string
	displayName: string
	imageUrl?: string
	className?: string
}>

export default function UserAvatar({
	login,
	displayName,
	imageUrl,
	className,
}: Props) {
	return (
		<Avatar className={cn('aspect-square h-auto w-auto', className)}>
			<AvatarImage src={imageUrl} alt={login} />
			<AvatarFallback>
				{displayName
					.split(' ', 2)
					.map(p => p[0].toUpperCase())
					.join('')}
			</AvatarFallback>
		</Avatar>
	)
}
