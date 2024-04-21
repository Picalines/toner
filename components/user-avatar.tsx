'use client'

import { AvatarImage } from '@radix-ui/react-avatar'
import { Avatar, AvatarFallback } from './ui/avatar'

type Props = Readonly<{
	login: string
	displayName: string
	imageUrl?: string
	className?: string
	fallbackClassName?: string
}>

export default function UserAvatar({
	login,
	displayName,
	imageUrl,
	className,
	fallbackClassName,
}: Props) {
	return (
		<Avatar className={className}>
			<AvatarImage src={imageUrl} alt={login} />
			<AvatarFallback className={fallbackClassName}>
				{displayName
					.split(' ', 2)
					.map(p => p[0].toUpperCase())
					.join('')}
			</AvatarFallback>
		</Avatar>
	)
}
