'use client'

import { PencilIcon, Trash2Icon, UploadIcon } from 'lucide-react'
import Link from 'next/link'
import { PropsWithChildren } from 'react'
import BackButton from '@/components/back-button'
import ThemeToggle from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Props = Readonly<{
	compositionId: number
	compositionName: string
}>

export default function EditorHeader({
	compositionId,
	compositionName: initialName,
}: Props) {
	return (
		<div className="flex items-center justify-between border-b p-2">
			<BackButton variant="outline" text={null} />
			<ProjectDropdownMenu compositionId={compositionId}>
				<Button variant="ghost">{initialName}</Button>
			</ProjectDropdownMenu>
			<ThemeToggle variant="outline" themeName={false} />
		</div>
	)
}

function ProjectDropdownMenu({
	compositionId,
	children,
}: PropsWithChildren & Readonly<{ compositionId: number }>) {
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
