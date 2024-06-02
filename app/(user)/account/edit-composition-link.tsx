import Link from 'next/link'
import type { ComponentProps } from 'react'
import { cn, getRelativeTimeString } from '@/lib/utils'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

type Props = Omit<ComponentProps<typeof Link>, 'children' | 'id' | 'href'> &
	Readonly<{
		id: string | number
		name: string
		description?: string
		createdAt: Date
		updatedAt: Date | null
	}>

export default function EditCompositionLink({
	id,
	name,
	description,
	createdAt,
	updatedAt,
	className,
	...linkProps
}: Props) {
	return (
		<Link
			{...linkProps}
			href={`/projects/${id}`}
			className={cn('group', className)}
		>
			<Card className="w-full transition group-hover:border-primary">
				<CardHeader>
					<CardTitle>{name}</CardTitle>
					<CardDescription>
						{updatedAt ? 'Updated' : 'Created'}{' '}
						{getRelativeTimeString(updatedAt ?? createdAt)}
					</CardDescription>
				</CardHeader>
				<CardContent className="truncate">
					{description || (
						<span className="italic text-gray-400">
							No description
						</span>
					)}
				</CardContent>
			</Card>
		</Link>
	)
}
