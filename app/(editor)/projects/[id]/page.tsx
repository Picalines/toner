import { authenticateOrRedirect } from '@/lib/auth'
import { DeepReadonly, capitalize } from '@/lib/utils'
import { AudioNodeType } from '@/schemas/nodes'
import CompositionEditor from '@/components/editor/composition-editor'
import CompositionStoreProvider from '@/components/providers/composition-store-provider'
import EditorStoreProvider from '@/components/providers/editor-store-provider'
import ToneStoreProvider from '@/components/providers/tone-store-provider'
import ChangeWatcher from './change-watcher'
import EditorHeader from './editor-header'
import { fetchAudioTree, fetchComposition } from './fetch-composition'
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
				<EditorStoreProvider
					initialState={{
						dirtyState: 'clean',
						openedModal: null,
						panelLayout: 'horizontal',
					}}
				>
					<ChangeWatcher>
						<div className="flex h-[100svh] max-h-[100svh] flex-col">
							<EditorHeader />
							<CompositionEditor className="w-full flex-grow" />
						</div>
					</ChangeWatcher>
					<UpdateInfoModal />
				</EditorStoreProvider>
			</ToneStoreProvider>
		</CompositionStoreProvider>
	)
}
