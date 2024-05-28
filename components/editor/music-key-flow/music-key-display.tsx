import { NodeProps } from '@xyflow/react'
import { AudioNodeId } from '@/lib/schemas/audio-node'
import { useCompositionStore } from '@/components/providers/composition-store-provider'
import { Card } from '@/components/ui/card'
import { CompositionStore } from '@/stores/composition-store'
import { MusicKeyNode } from './music-key-node'

const instrumentNameSelector =
	(instrumentId: AudioNodeId) =>
	({ getNodeById }: CompositionStore) =>
		getNodeById(instrumentId)?.label

export default function MusicKeyDisplay({
	width,
	height,
	data: { instrumentId },
}: NodeProps<MusicKeyNode>) {
	const instrumentName = useCompositionStore(
		instrumentNameSelector(instrumentId),
	)

	return (
		<Card
			style={{ width: width + 'px', height: height + 'px' }}
			className="group flex items-center rounded-sm border-2 border-black border-opacity-30 bg-red-500"
		>
			<span className="truncate opacity-25 transition group-hover:opacity-100">
				{instrumentName}
			</span>
		</Card>
	)
}
