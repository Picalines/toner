import { Handle, NodeProps, Position } from '@xyflow/react'
import { Volume2Icon } from 'lucide-react'
import { cn, tw } from '@/lib/utils'
import { AudioNodeGroup, audioNodeDefinitions } from '@/schemas/audio-node'
import { AudioNode } from '@/stores/composition-store'
import { EditorStore } from '@/stores/editor-store'
import { useEditorStore } from '../providers/editor-store-provider'
import { Card } from '../ui/card'

const nodeGroupClassNames: Record<AudioNodeGroup, string> = {
	output: tw`bg-neutral-500`,
	instrument: tw`bg-red-500`,
	effect: tw`bg-orange-500`,
	component: tw`bg-cyan-500`,
}

const instrumentSelector = ({ selectedInstrumentId }: EditorStore) =>
	selectedInstrumentId

export default function AudioNodeDisplay({
	id: nodeId,
	selected,
	data: { type, label },
}: NodeProps<AudioNode>) {
	const selectedInstrumentId = useEditorStore(instrumentSelector)
	const { group, inputs, outputs } = audioNodeDefinitions[type]

	return (
		<Card
			className={cn(
				'h-16 w-24 border-2 border-black border-opacity-30 p-2 outline outline-0 outline-primary transition-all',
				nodeGroupClassNames[group],
				selected && 'outline-2',
			)}
		>
			{inputs.map((_, i) => (
				<Handle
					key={i}
					type="target"
					id={String(i)}
					position={Position.Left}
				/>
			))}
			{outputs.map((_, i) => (
				<Handle
					key={i}
					type="source"
					id={String(i)}
					position={Position.Right}
				/>
			))}
			<div className="absolute inset-1 flex flex-row gap-1">
				<span className="flex-grow text-white">{label}</span>
				{selectedInstrumentId == nodeId ? (
					<Volume2Icon className="h-4 w-4 text-white animate-in zoom-in" />
				) : null}
			</div>
		</Card>
	)
}
