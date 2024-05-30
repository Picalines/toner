import { Node, NodeTypes } from '@xyflow/react'
import { NodeProps } from '@xyflow/react'
import { AudioNodeId } from '@/lib/schemas/audio-node'
import { MusicKey } from '@/lib/schemas/music'
import { cn } from '@/lib/utils'
import { useCompositionStore } from '@/components/providers/composition-store-provider'
import { Card } from '@/components/ui/card'
import { CompositionStore } from '@/stores/composition-store'

export const musicFlowNodeType = 'music-key'

export type MusicKeyNode = Node<
	Pick<MusicKey, 'instrumentId' | 'velocity'>,
	typeof musicFlowNodeType
>

export const musicNodeTypes = {
	[musicFlowNodeType]: MusicKeyDisplay,
} satisfies NodeTypes

const instrumentNameSelector =
	(instrumentId: AudioNodeId) =>
	({ getAudioNodeById: getNodeById }: CompositionStore) =>
		getNodeById(instrumentId)?.label

function MusicKeyDisplay({
	width,
	height,
	selected,
	data: { instrumentId },
}: NodeProps<MusicKeyNode>) {
	const instrumentName = useCompositionStore(
		instrumentNameSelector(instrumentId),
	)

	return (
		<Card
			style={{ width: width + 'px', height: height + 'px' }}
			className={cn(
				'group flex items-center rounded-sm border-2 border-black border-opacity-30 bg-red-500 transition-all',
				selected &&
					'border-blue-400 border-opacity-100 dark:border-white',
			)}
		>
			<span className="truncate opacity-25 transition group-hover:opacity-100">
				{instrumentName}
			</span>
		</Card>
	)
}
