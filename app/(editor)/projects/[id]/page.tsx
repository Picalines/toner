import { authenticateOrRedirect } from '@/lib/auth'
import { DeepReadonly } from '@/lib/utils'
import CompositionEditor from '@/components/editor/composition-editor'
import CompositionStoreProvider from '@/components/providers/composition-store-provider'
import EditorStoreProvider from '@/components/providers/editor-store-provider'
import EditorHeader from './editor-header'
import { fetchComposition } from './fetch-composition'
import { parseProjectId } from './parse-project-id'
import UpdateInfoModal from './update-info-modal'

type Props = DeepReadonly<{
	params: {
		id: string
	}
}>

export default async function EditorPage({ params }: Props) {
	const compositionId = parseProjectId(params)

	const {
		user: { id: accountId },
	} = await authenticateOrRedirect('/sign-in')

	const composition = await fetchComposition(accountId, compositionId)

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
					<CompositionEditor />
				</div>
				<UpdateInfoModal />
			</EditorStoreProvider>
		</CompositionStoreProvider>
	)
}
