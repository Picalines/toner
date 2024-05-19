import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { capitalize } from '@/lib/utils'
import { AudioNodeType, audioNodeDefinitions } from '@/schemas/audio-node'
import { EditorStore } from '@/stores/editor-store'
import { useCompositionStoreApi } from '../providers/composition-store-provider'
import { useEditorStoreApi } from '../providers/editor-store-provider'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '../ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

const modalSelector = ({ openedModal, closeModal }: EditorStore) => ({
	openedModal,
	closeModal,
})

const commandItems = Object.entries(audioNodeDefinitions).flatMap(
	([nodeType, { group }]) =>
		nodeType != 'output'
			? [{ nodeType: nodeType as AudioNodeType, group }]
			: [],
)

export default function CreateNodeModal() {
	const compositionStore = useCompositionStoreApi()

	const editorStore = useEditorStoreApi()
	const { openedModal, closeModal } = useStore(
		editorStore,
		useShallow(modalSelector),
	)

	const onOpenChange = (open: boolean) => {
		if (!open) {
			closeModal()
		}
	}

	const onItemSelect = (nodeType: AudioNodeType) => () => {
		const { createNode } = compositionStore.getState()
		createNode(nodeType, editorStore.getState().nodeCursor)
		closeModal()
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
