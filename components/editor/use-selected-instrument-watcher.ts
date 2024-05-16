import { useEffect } from 'react'
import { audioNodeDefinitions } from '@/schemas/audio-node'
import { useCompositionStoreApi } from '../providers/composition-store-provider'
import { useEditorStoreApi } from '../providers/editor-store-provider'

export function useSelectedInstrumentWatcher() {
	const compositionStoreApi = useCompositionStoreApi()
	const editorStoreApi = useEditorStoreApi()

	useEffect(() => {
		const unsubscribeComp = compositionStoreApi.subscribe(
			comp => comp.selectedNodeId,
			selectedNodeId => {
				const { getNodeById } = compositionStoreApi.getState()
				const { selectedInstrumentId: currentInstrumentId } =
					editorStoreApi.getState()

				if (
					currentInstrumentId !== null &&
					selectedNodeId === null &&
					getNodeById(currentInstrumentId) === null
				) {
					editorStoreApi.setState({ selectedInstrumentId: null })
					return
				}

				const node = selectedNodeId ? getNodeById(selectedNodeId) : null
				if (!node) {
					// TODO: getSelectedNode?
					return
				}

				const {
					id: nodeId,
					data: { type: nodeType },
				} = node
				const { group } = audioNodeDefinitions[nodeType]

				if (group != 'instrument') {
					return
				}

				editorStoreApi.setState({ selectedInstrumentId: nodeId })
			},
		)

		return () => {
			unsubscribeComp()
		}
	}, [compositionStoreApi, editorStoreApi])
}
