import { authenticateOrRedirect } from '@/lib/auth'
import { DeepReadonly } from '@/lib/utils'
import CompositionEditor from '@/components/editor/composition-editor'
import CompositionStoreProvider from '@/components/providers/composition-store-provider'
import EditorStoreProvider from '@/components/providers/editor-store-provider'
import { fetchComposition } from './actions'
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

	return (
		<CompositionStoreProvider
			initialState={{
				...composition,
			}}
		>
			<EditorStoreProvider
				initialState={{ openedModal: null, panelLayout: 'horizontal' }}
			>
				<div className="flex h-[100svh] max-h-[100svh] flex-col">
					<EditorHeader />
					<CompositionEditor className="w-full flex-grow" />
				</div>
				<UpdateInfoModal />
			</EditorStoreProvider>
		</CompositionStoreProvider>
	)
}
