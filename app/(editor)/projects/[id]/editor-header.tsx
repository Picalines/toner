'use client'

import {
	EllipsisIcon,
	LayoutIcon,
	PencilIcon,
	Trash2Icon,
	UploadIcon,
} from 'lucide-react'
import Link from 'next/link'
import { PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'
import BackButton from '@/components/back-button'
import { useCompositionStore } from '@/components/providers/composition-store-provider'
import { useEditorStore } from '@/components/providers/editor-store-provider'
import ThemeToggle from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Props = Readonly<{
	className?: string
}>

export default function EditorHeader({ className }: Props) {
	const compositionName = useCompositionStore(composition => composition.name)

	const dirtyState = useEditorStore(editor => editor.dirtyState)

	return (
		<div
			className={cn(
				'flex items-center justify-between border-b p-2',
				className,
			)}
		>
			<title>{compositionName}</title>
			<BackButton
				variant="outline"
				text={null}
				disabled={dirtyState != 'clean'}
				className={cn(
					'transition-all',
					dirtyState == 'saving' && 'animate-pulse',
				)}
			/>
			<EditorDropdownMenu>
				<Button variant="outline">
					<EllipsisIcon />
				</Button>
			</EditorDropdownMenu>
		</div>
	)
}

function EditorDropdownMenu({ children }: PropsWithChildren) {
	const compositionName = useCompositionStore(composition => composition.name)

	const compositionId = useCompositionStore(composition => composition.id)
	const openModal = useEditorStore(editor => editor.openModal)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>{compositionName}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="cursor-pointer space-x-2"
					onClick={() => openModal('updateInfo')}
				>
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
				<ViewMenuItems />
				<DropdownMenuSeparator />
				<DropdownMenuItem className="cursor-pointer space-x-2 text-destructive">
					<Trash2Icon />
					<span>Delete</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

function ViewMenuItems() {
	const panelLayout = useEditorStore(editor => editor.panelLayout)
	const setPanelLayout = useEditorStore(editor => editor.setPanelLayout) as (
		newLayout: string,
	) => void

	return (
		<>
			<DropdownMenuItem className="p-0">
				<ThemeToggle
					themeName
					variant="ghost"
					className="w-full cursor-pointer justify-start space-x-2 p-2"
				/>
			</DropdownMenuItem>
			<DropdownMenuSub>
				<DropdownMenuSubTrigger className="space-x-2">
					<LayoutIcon />
					<span>Layout</span>
				</DropdownMenuSubTrigger>
				<DropdownMenuPortal>
					<DropdownMenuSubContent>
						<DropdownMenuRadioGroup
							value={panelLayout}
							onValueChange={setPanelLayout}
						>
							<DropdownMenuRadioItem value="horizontal">
								Horizontal
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="vertical">
								Vertical
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuPortal>
			</DropdownMenuSub>
		</>
	)
}
