import { Node, NodeTypes } from '@xyflow/react'
import { NodeProps } from '@xyflow/react'
import { VolumeXIcon } from 'lucide-react'
import { AudioNodeId } from '@/lib/schemas/audio-node'
import { MusicKey } from '@/lib/schemas/music'
import { cn } from '@/lib/utils'
import { useCompositionStore } from '@/components/providers/composition-store-provider'
import { Card } from '@/components/ui/card'
import { CompositionStore } from '@/stores/composition-store'

export const musicFlowNodeType = 'music-key'

export type MusicKeyNode = Node<
	Pick<MusicKey, 'instrumentId' | 'velocity'> & {
		isOnCurrentLayer: boolean
		// TODO: add layerIndex or smth to visually group keys on other layers
	},
	typeof musicFlowNodeType
>

export const musicNodeTypes = {
	[musicFlowNodeType]: MusicKeyNode,
} satisfies NodeTypes

const instrumentNameSelector =
	(instrumentId: AudioNodeId) =>
	({ getAudioNodeById: getNodeById }: CompositionStore) =>
		getNodeById(instrumentId)?.label

function MusicKeyNode({
	width,
	height,
	selected,
	data: { isOnCurrentLayer, instrumentId },
}: NodeProps<MusicKeyNode>) {
	const instrumentName = useCompositionStore(
		instrumentNameSelector(instrumentId),
	)

	const instrumentExists = instrumentName !== undefined

	return (
		<Card
			style={{ width: width + 'px', height: height + 'px' }}
			className={cn(
				'group flex items-center rounded-sm border-2 border-black border-opacity-30 pl-[2px] transition-all',
				instrumentExists ? 'bg-red-500' : 'bg-neutral-500',
				selected &&
					'border-blue-400 border-opacity-100 dark:border-white',
				// TODO: add blur when some 'solo' option is set
				!isOnCurrentLayer && 'pointer-events-none -z-10 opacity-25',
			)}
		>
			{isOnCurrentLayer ? (
				<span className="truncate opacity-25 transition group-hover:opacity-100">
					{instrumentName ?? <VolumeXIcon className="h-5 w-5" />}
				</span>
			) : null}
		</Card>
	)
}
