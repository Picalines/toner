'use client'

import {
	ChevronsUpDownIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
} from 'lucide-react'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn, mapIterArray, takeFirst, takeWhile } from '@/lib/utils'
import { MusicLayerId } from '@/schemas/music'
import { CompositionStore } from '@/stores/composition-store'
import { EditorStore } from '@/stores/editor-store'
import { useCompositionStore } from '../providers/composition-store-provider'
import { useEditorStore } from '../providers/editor-store-provider'
import { Button } from '../ui/button'
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

type Props = { className?: string }

const compositionSelector = ({
	musicLayers,
	createMusicLayer,
	renameMusicLayer,
	removeMusicLayer,
}: CompositionStore) => ({
	musicLayers,
	createMusicLayer,
	renameMusicLayer,
	removeMusicLayer,
})

const editorSelector = ({
	selectedMusicLayerId,
	selectMusicLayer,
}: EditorStore) => ({
	selectedMusicLayerId,
	selectMusicLayer,
})

export default function MusicLayerSelector({ className }: Props) {
	const {
		musicLayers,
		createMusicLayer,
		renameMusicLayer,
		removeMusicLayer,
	} = useCompositionStore(useShallow(compositionSelector))

	const { selectedMusicLayerId, selectMusicLayer } = useEditorStore(
		useShallow(editorSelector),
	)

	const [open, setOpen] = useState(false)
	const [inputValue, setInputValue] = useState('')

	const closeCommand = () => {
		setOpen(false)
		setInputValue('')
	}

	const onSelectLayer = (layerId: MusicLayerId) => {
		selectMusicLayer(layerId)
		closeCommand()
	}

	const onSelectCreate = () => {
		const newLayerId = createMusicLayer(inputValue)
		if (newLayerId) {
			selectMusicLayer(newLayerId)
		}
		closeCommand()
	}

	const onSelectRename = () => {
		renameMusicLayer(selectedMusicLayerId, inputValue)
		closeCommand()
	}

	const onSelectDelete = () => {
		const nextLayerToSelect = takeFirst(
			takeWhile(musicLayers.keys(), id => id != selectedMusicLayerId),
		)
		removeMusicLayer(selectedMusicLayerId)
		selectMusicLayer(nextLayerToSelect!)
		closeCommand()
	}

	const currentLayerName = musicLayers.get(selectedMusicLayerId)?.name

	return (
		<div className={cn('bg-background', className)}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						className="h-full w-full gap-1 rounded-none p-2 focus-visible:ring-transparent focus-visible:ring-offset-transparent"
					>
						<span className="flex-grow text-left">
							{currentLayerName}
						</span>
						<ChevronsUpDownIcon width={12} className="opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent side="bottom" className="max-w-40 p-1">
					<Command className="p-0">
						<CommandInput
							placeholder="search"
							className="h-8"
							value={inputValue}
							onValueChange={setInputValue}
						/>
						<CommandList>
							<CommandGroup className="px-0" forceMount>
								{mapIterArray(
									musicLayers.values(),
									({ id: layerId, name: layerName }) => (
										<CommandItem
											key={layerId}
											onSelect={() =>
												onSelectLayer(layerId)
											}
										>
											{layerName}
										</CommandItem>
									),
								)}
								<CommandItem
									value={'rename-' + currentLayerName}
									onSelect={
										inputValue ? onSelectRename : undefined
									}
									disabled={!inputValue}
									className="gap-1"
									forceMount
								>
									<PencilIcon width={12} height={12} />
									{inputValue
										? `to '${inputValue}'`
										: 'rename...'}
								</CommandItem>
								<CommandItem
									value={'new-' + inputValue}
									onSelect={
										inputValue ? onSelectCreate : undefined
									}
									disabled={!inputValue}
									className="gap-1"
									forceMount
								>
									<PlusIcon width={12} height={12} />{' '}
									{inputValue
										? `'${inputValue}'`
										: 'create...'}
								</CommandItem>
								{musicLayers.size > 1 ? (
									<CommandItem
										value={'remove-' + currentLayerName}
										onSelect={onSelectDelete}
										className="gap-1"
										forceMount
									>
										<Trash2Icon width={12} height={12} />
										{currentLayerName}
									</CommandItem>
								) : null}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	)
}
