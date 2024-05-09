import { authenticateOrRedirect } from '@/lib/auth'
import { DeepReadonly } from '@/lib/utils'
import CompositionEditor from '@/components/editor/composition-editor'
import CompositionStoreProvider from '@/components/providers/composition-store-provider'
import EditorStoreProvider from '@/components/providers/editor-store-provider'
import ToneStoreProvider from '@/components/providers/tone-store-provider'
import { fetchAudioTree, fetchComposition } from './actions'
import EditorHeader from './editor-header'
import { parseProjectId } from './parse-project-id'
import UpdateInfoModal from './update-info-modal'

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
				id: nodeId,
				position: { x: node.centerX, y: node.centerY },
				data: {
					label: node.displayName ?? node.type,
					properties: node.properties,
				},
				label: node.type,
			}))}
			edges={audioTree.connections.map(
				// TODO: sockets
				([[senderId, senderSocket], [receiverId, receiverSocket]]) => ({
					id: `${senderId}.${senderSocket}-${receiverId}${receiverSocket}`,
					type: 'default',
					source: senderId,
					target: receiverId,
				}),
			)}
		>
			<ToneStoreProvider>
				<EditorStoreProvider
					initialState={{
						openedModal: null,
						panelLayout: 'horizontal',
					}}
				>
					<div className="flex h-[100svh] max-h-[100svh] flex-col">
						<EditorHeader />
						<CompositionEditor className="w-full flex-grow" />
					</div>
					<UpdateInfoModal />
				</EditorStoreProvider>
			</ToneStoreProvider>
		</CompositionStoreProvider>
	)
}
