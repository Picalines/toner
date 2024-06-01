'use client'

import {
	ChevronsUpDownIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
} from 'lucide-react'
import { useState } from 'react'
import { useStore } from 'zustand'
import { MusicLayerId } from '@/lib/schemas/music'
import { cn, takeFirst, takeWhile } from '@/lib/utils'
import { CompositionStore } from '@/stores/composition-store'
import { EditorStore } from '@/stores/editor-store'
import { useCompositionStoreApi } from '../providers/composition-store-provider'
import { useEditorStoreApi } from '../providers/editor-store-provider'
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

const musicLayersSelector = ({ musicLayers }: CompositionStore) => musicLayers

const currentLayerSelector = ({ selectedMusicLayerId }: EditorStore) =>
	selectedMusicLayerId

export default function MusicLayerSelector({ className }: Props) {
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()

	const musicLayers = useStore(compositionStore, musicLayersSelector)
	const selectedMusicLayerId = useStore(editorStore, currentLayerSelector)

	const [open, setOpen] = useState(false)
	const [inputValue, setInputValue] = useState('')

	const closeCommand = () => {
		setOpen(false)
		setInputValue('')
	}

	const onSelectLayer = (layerId: MusicLayerId) => {
		const { selectMusicLayer } = editorStore.getState()
		selectMusicLayer(layerId)
		closeCommand()
	}

	const onSelectCreate = () => {
		const { createMusicLayer } = compositionStore.getState()
		const { selectMusicLayer, applyChange } = editorStore.getState()
		const newLayer = createMusicLayer(inputValue)
		if (newLayer) {
			const { id, name } = newLayer
			selectMusicLayer(id)
			applyChange({ type: 'music-layer-add', id, name })
		}
		closeCommand()
	}

	const onSelectRename = () => {
		if (!selectedMusicLayerId) {
			return
		}

		const { renameMusicLayer } = compositionStore.getState()
		const { applyChange } = editorStore.getState()

		renameMusicLayer(selectedMusicLayerId, inputValue)
		applyChange({
			type: 'music-layer-update',
			id: selectedMusicLayerId,
			name: inputValue,
		})

		closeCommand()
	}

	const onSelectDelete = () => {
		if (!selectedMusicLayerId) {
			return
		}

		const { removeMusicLayer } = compositionStore.getState()
		const { selectMusicLayer, applyChange } = editorStore.getState()

		const nextLayerToSelect = takeFirst(
			takeWhile(musicLayers.keys(), id => id != selectedMusicLayerId),
		)

		removeMusicLayer(selectedMusicLayerId)
		applyChange({ type: 'music-layer-remove', id: selectedMusicLayerId })

		selectMusicLayer(nextLayerToSelect!)
		closeCommand()
	}

	const currentLayerName = selectedMusicLayerId
		? musicLayers.get(selectedMusicLayerId)?.name
		: null

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
								{[...musicLayers.values()].map(
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
