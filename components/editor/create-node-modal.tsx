import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { capitalize } from '@/lib/utils'
import { AudioNodeType, audioNodeDefinitions } from '@/schemas/audio-node'
import { CompositionStore } from '@/stores/composition-store'
import { EditorStore } from '@/stores/editor-store'
import { useCompositionStore } from '../providers/composition-store-provider'
import { useEditorStore } from '../providers/editor-store-provider'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '../ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

const editorSelector = ({
	openedModal,
	closeModal,
	nodeCursor,
}: EditorStore) => ({
	openedModal,
	closeModal,
	nodeCursor,
})

const compSelector = ({ createNode }: CompositionStore) => ({ createNode })

const commandItems = Object.entries(audioNodeDefinitions).flatMap(
	([nodeType, { group }]) =>
		nodeType != 'output'
			? [{ nodeType: nodeType as AudioNodeType, group }]
			: [],
)

export default function CreateNodeModal() {
	const { openedModal, closeModal, nodeCursor } = useEditorStore(
		useShallow(editorSelector),
	)

	const { createNode } = useCompositionStore(useShallow(compSelector))

	const onOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				closeModal()
			}
		},
		[closeModal],
	)

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
							{commandItems.map(({ nodeType, group }, i) => (
								<CommandItem
									key={i}
									className="flex justify-between"
									value={nodeType}
									onSelect={() => {
										createNode(nodeType, nodeCursor)
										closeModal()
									}}
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
