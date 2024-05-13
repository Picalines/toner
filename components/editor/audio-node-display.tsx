import { Handle, NodeProps, Position } from '@xyflow/react'
import { cn, tw } from '@/lib/utils'
import { AudioNodeGroup, audioNodeSchemas } from '@/schemas/nodes'
import { AudioNode } from '@/stores/composition-store'
import { Card, CardHeader } from '../ui/card'

const nodeGroupClassNames: Record<AudioNodeGroup, string> = {
	instrument: tw`bg-red-500`,
	effect: tw`bg-orange-500`,
	output: tw`bg-neutral-500`,
}

export default function AudioNodeDisplay({
	selected,
	data: { type, label },
}: NodeProps<AudioNode>) {
	const { group, inputs, outputs } = audioNodeSchemas[type]

	return (
		<Card
			className={cn(
				'p-2 outline outline-0 outline-primary transition-all',
				nodeGroupClassNames[group],
				selected && 'outline-2',
			)}
		>
			{inputs.map(({ name }) => (
				<Handle key={name} type="target" position={Position.Left} />
			))}
			{outputs.map(({ name }) => (
				<Handle key={name} type="source" position={Position.Right} />
			))}
			<CardHeader className="p-0 text-white">{label}</CardHeader>
		</Card>
	)
}
