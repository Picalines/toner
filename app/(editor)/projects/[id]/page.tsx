import { authenticateOrRedirect } from '@/lib/auth'
import { DeepReadonly, capitalize } from '@/lib/utils'
import { audioNodeSchemas } from '@/schemas/audio-node'
import CompositionEditor from '@/components/editor/composition-editor'
import CompositionStoreProvider from '@/components/providers/composition-store-provider'
import ToneStoreProvider from '@/components/providers/tone-store-provider'
import { fetchComposition } from './fetch-composition'
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

	const {
		name,
		description,
		audioNodes,
		audioEdges,
		musicLayers,
		musicKeys,
	} = await fetchComposition(compositionId)

	return (
		<CompositionStoreProvider
			id={compositionId}
			name={name}
			description={description}
			audioNodes={Object.entries(audioNodes).map(([nodeId, node]) =>
				audioNodeSchemas.node.parse({
					id: nodeId,
					type: node.type,
					label: node.label ?? capitalize(node.type),
					position: [node.centerX, node.centerY],
					properties: node.properties,
				}),
			)}
			audioEdges={Object.entries(audioEdges).map(
				([
					id,
					{
						source: [source, sourceSocket],
						target: [target, targetSocket],
					},
				]) =>
					audioNodeSchemas.edge.parse({
						id,
						source,
						target,
						sourceSocket,
						targetSocket,
					}),
			)}
			musicLayers={Object.entries(musicLayers).map(
				([layerId, layer]) => ({ id: layerId, ...layer }),
			)}
			musicKeys={Object.entries(musicKeys).map(([keyId, musicKey]) => ({
				id: keyId,
				...musicKey,
			}))}
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
