import {
	Edge,
	Handle,
	Node,
	NodeProps,
	NodeTypes,
	Position,
} from '@xyflow/react'
import { KeyboardMusicIcon } from 'lucide-react'
import {
	AudioNode,
	AudioNodeGroup,
	audioNodeDefinitions,
} from '@/lib/schemas/audio-node'
import { cn, tw } from '@/lib/utils'
import { useEditorStore } from '@/components/providers/editor-store-provider'
import { Card } from '@/components/ui/card'
import { EditorStore } from '@/stores/editor-store'

export const audioFlowNodeType = 'audio'

export type AudioFlowNode = Node<
	Pick<AudioNode, 'type' | 'label'>,
	typeof audioFlowNodeType
>

export type AudioFlowEdge = Edge<{}>

export const audioNodeTypes = {
	[audioFlowNodeType]: AudioNodeDisplay,
} satisfies NodeTypes

const nodeGroupClassNames: Record<AudioNodeGroup, string> = {
	output: tw`bg-neutral-500`,
	instrument: tw`bg-red-500`,
	effect: tw`bg-orange-500`,
	component: tw`bg-cyan-500`,
}

const instrumentSelector = ({ playbackInstrumentId }: EditorStore) =>
	playbackInstrumentId

function AudioNodeDisplay({
	id: nodeId,
	selected,
	width,
	height,
	data: { type, label },
}: NodeProps<AudioFlowNode>) {
	// TODO: move playback indicator to AudioFlowNode data.
	// reason: whole flow is rerendered as is, so we can gather
	// data once when composition store changes, and then just display it
	const selectedInstrumentId = useEditorStore(instrumentSelector)

	const { group, inputs, outputs } = audioNodeDefinitions[type]

	return (
		<Card
			className={cn(
				'border-2 border-black border-opacity-30 p-2 transition-all',
				nodeGroupClassNames[group],
				selected &&
					'border-blue-400 border-opacity-100 dark:border-white',
			)}
			style={{ width: width + 'px', height: height + 'px' }}
		>
			{inputs.map((_, i) => (
				<Handle
					key={i}
					type="target"
					id={String(i)}
					position={Position.Left}
					className="!h-2 !w-2"
				/>
			))}
			{outputs.map((_, i) => (
				<Handle
					key={i}
					type="source"
					id={String(i)}
					position={Position.Right}
					className="!h-2 !w-2"
				/>
			))}
			<div className="absolute inset-1 left-2 flex flex-row gap-1">
				<span className="flex-grow text-sm text-white">{label}</span>
				{selectedInstrumentId == nodeId ? (
					<KeyboardMusicIcon className="h-4 w-4 text-white animate-in zoom-in" />
				) : null}
			</div>
		</Card>
	)
}
