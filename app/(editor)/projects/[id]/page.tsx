import { authenticateOrRedirect } from '@/lib/auth'
import { DeepReadonly } from '@/lib/utils'
import KeyAreaBackground from '@/components/editor/key-area-background'
import CompositionStoreProvider from '@/components/providers/composition-store-provider'
import EditorHeader from './editor-header'
import { fetchComposition } from './fetch-composition'
import { parseProjectId } from './parse-project-id'

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
		<div className="flex max-h-[100svh] flex-col">
			<CompositionStoreProvider
				initialState={{
					...composition,
				}}
			>
				<EditorHeader />
				<div className="max-w-full flex-grow overflow-scroll">
					<KeyAreaBackground
						className="w-full"
						lineHeight={24}
						numberOfLines={120}
					/>
				</div>
			</CompositionStoreProvider>
		</div>
	)
}
