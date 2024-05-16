import { authenticateOrRedirect } from '@/lib/auth'
import { DeepReadonly, capitalize } from '@/lib/utils'
import { AudioNodeType } from '@/schemas/audio-node'
import CompositionEditor from '@/components/editor/composition-editor'
import CompositionStoreProvider from '@/components/providers/composition-store-provider'
import ToneStoreProvider from '@/components/providers/tone-store-provider'
import { fetchAudioTree, fetchComposition } from './fetch-composition'
import { parseProjectId } from './parse-project-id'
import { updateComposition } from './update-composition'

type Props = DeepReadonly<{
	params: {
		id: string
	}
}>

export default async function EditorPage({ params }: Props) {
	const compositionId = parseProjectId(params)

	await authenticateOrRedirect('/sign-in')

	const composition = await fetchComposition(compositionId)
	const audioTree = await fetchAudioTree(compositionId)

	return (
		<CompositionStoreProvider
			{...composition}
			nodes={Object.entries(audioTree.nodes).map(([nodeId, node]) => ({
				type: 'audio',
				id: nodeId,
				position: { x: node.centerX, y: node.centerY },
				deletable: node.type != 'output',
				data: {
					type: node.type as AudioNodeType,
					label: node.label ?? capitalize(node.type),
					properties: node.properties,
				},
			}))}
			edges={audioTree.edges.map(
				({
					id,
					source: [source, sourceHandle],
					target: [target, targetHandle],
				}) => ({
					id,
					type: 'default',
					source,
					target,
					sourceHandle: String(sourceHandle),
					targetHandle: String(targetHandle),
				}),
			)}
		>
			<ToneStoreProvider>
				<div className="flex h-[100svh] max-h-[100svh] flex-col">
					<CompositionEditor
						onCompositionUpdate={updateComposition}
					/>
				</div>
			</ToneStoreProvider>
		</CompositionStoreProvider>
	)
}
