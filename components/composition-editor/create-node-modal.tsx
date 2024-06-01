import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { AudioNodeType, audioNodeDefinitions } from '@/lib/schemas/audio-node'
import { EditorStore } from '@/lib/stores'
import { capitalize } from '@/lib/utils'
import { useCompositionStoreApi, useEditorStoreApi } from '../providers'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '../ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

const modalSelector = ({ openedModal }: EditorStore) => openedModal

const commandItems = Object.entries(audioNodeDefinitions).flatMap(
	([nodeType, { group }]) =>
		nodeType != 'output'
			? [{ nodeType: nodeType as AudioNodeType, group }]
			: [],
)

export default function CreateNodeModal() {
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()

	const openedModal = useStore(editorStore, useShallow(modalSelector))

	const onOpenChange = (open: boolean) => {
		if (!open) {
			editorStore.getState().closeModal()
		}
	}

	const onItemSelect = (nodeType: AudioNodeType) => () => {
		const { createAudioNode } = compositionStore.getState()
		const { applyChange } = editorStore.getState()

		const { id, label, properties, position } = createAudioNode(
			nodeType,
			editorStore.getState().nodeCursor,
		)

		applyChange({
			type: 'node-add',
			nodeType,
			id,
			label,
			properties,
			position,
		})

		editorStore.getState().closeModal()
	}

	return (
		<Dialog open={openedModal == 'node-add'} onOpenChange={onOpenChange}>
			<DialogContent className="w-96">
				<DialogHeader>
					<DialogTitle>Add node</DialogTitle>
				</DialogHeader>
				<Command>
					<CommandInput placeholder="Search node type" />
					<CommandList>
						<CommandEmpty>Not found</CommandEmpty>
						<CommandGroup>
							{commandItems.map(({ nodeType, group }) => (
								<CommandItem
									key={nodeType}
									className="flex justify-between"
									value={nodeType}
									onSelect={onItemSelect(nodeType)}
								>
									<span>{capitalize(nodeType)}</span>
									<span className="text-neutral-500">
										{group}
									</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	)
}
