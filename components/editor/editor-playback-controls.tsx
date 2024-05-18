'use client'

import { PlayIcon, RepeatIcon, SquareIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

type Props = Readonly<{
	className?: string
}>

// TODO: ui mockup, add functionality

export default function EditorPlaybackControls({ className }: Props) {
	return (
		<div
			className={cn(
				'flex w-min flex-row gap-1 rounded-sm border',
				className,
			)}
		>
			<Button variant="ghost" className="aspect-square p-2">
				<PlayIcon className="h-4 w-4 text-green-500 dark:text-green-400" />
			</Button>
			<Button variant="ghost" className="aspect-square p-2">
				<SquareIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
			</Button>
			<Button variant="ghost" className="aspect-square p-2">
				<RepeatIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
			</Button>
		</div>
	)
}
