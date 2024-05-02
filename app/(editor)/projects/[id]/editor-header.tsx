'use client'

import { PencilIcon, Trash2Icon, UploadIcon } from 'lucide-react'
import Link from 'next/link'
import { PropsWithChildren } from 'react'
import BackButton from '@/components/back-button'
import { useCompositionStore } from '@/components/providers/composition-store-provider'
import ThemeToggle from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function EditorHeader() {
	const compositionName = useCompositionStore(composition => composition.name)

	return (
		<div className="flex items-center justify-between border-b p-2">
			<BackButton variant="outline" text={null} />
			<ProjectDropdownMenu>
				<Button variant="ghost">{compositionName}</Button>
			</ProjectDropdownMenu>
			<ThemeToggle variant="outline" themeName={false} />
		</div>
	)
}

function ProjectDropdownMenu({ children }: PropsWithChildren) {
	const compositionId = useCompositionStore(composition => composition.id)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			<DropdownMenuContent align="center">
				<DropdownMenuItem className="cursor-pointer space-x-2">
					<PencilIcon />
					<span>Edit Info</span>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link
						href={`/projects/${compositionId}/publish`}
						className="cursor-pointer space-x-2"
					>
						<UploadIcon />
						<span>Publish</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="cursor-pointer space-x-2 text-destructive">
					<Trash2Icon />
					<span>Delete</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
