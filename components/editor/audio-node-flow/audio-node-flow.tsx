'use client'

import '@xyflow/react/dist/style.css'
import {
	Background,
	BackgroundVariant,
	ColorMode,
	Connection,
	EdgeChange,
	NodeChange,
	NodeTypes,
	ReactFlow,
	ReactFlowProps,
	ReactFlowProvider,
	ViewportPortal,
	useReactFlow,
} from '@xyflow/react'
import { Loader2Icon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { MouseEvent, useId } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { edgeChangeToEditor, nodeChangeToEditor } from '@/lib/editor'
import { useIsMountedState } from '@/lib/hooks'
import { audioNodeDefinitions } from '@/schemas/audio-node'
import {
	useCompositionStore,
	useCompositionStoreApi,
} from '@/components/providers/composition-store-provider'
import { useEditorStoreApi } from '@/components/providers/editor-store-provider'
import {
	AudioEdge,
	AudioNode,
	CompositionStore,
	CompositionStoreApi,
} from '@/stores/composition-store'
import { EditorStoreApi } from '@/stores/editor-store'
import AudioNodeDisplay from './audio-node-display'
import AudioNodeFlowControls from './audio-node-flow-controls'
import NodeFlowCursor from './node-flow-cursor'

export default function AudioNodeFlow() {
	return (
		<ReactFlowProvider>
			<AudioReactFlow />
		</ReactFlowProvider>
	)
}

const nodeTypes = { audio: AudioNodeDisplay } satisfies NodeTypes

const flowSelector = ({ audioNodes, audioEdges }: CompositionStore) => ({
	audioNodes,
	audioEdges,
})

function AudioReactFlow(props: ReactFlowProps<AudioNode, AudioEdge>) {
	const reactFlow = useReactFlow()
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()

	// NOTE: without unique id the viewport is shared between providers
	const flowId = useId()
	const backgroundId = useId()

	const { theme } = useTheme()
	const isMounted = useIsMountedState()

	const colorMode: ColorMode =
		(isMounted ? (theme as ColorMode) : null) ?? 'light'

	const { audioNodes, audioEdges } = useCompositionStore(
		useShallow(flowSelector),
	)

	const setCursorOnClick = (event: MouseEvent) => {
		const { x, y } = reactFlow.screenToFlowPosition({
			x: event.clientX,
			y: event.clientY,
		})
		editorStore.getState().setNodeCursor(x, y)
	}

	const onNodeChanges = (nodeChanges: NodeChange<AudioNode>[]) => {
		const { applyNodeChanges, getNodeById } = compositionStore.getState()
		const { applyChange } = editorStore.getState()

		for (const change of nodeChanges) {
			const editorChange = nodeChangeToEditor(change, getNodeById)
			if (editorChange) {
				applyChange(editorChange)
			}
			updateNodeSelection(editorStore, compositionStore, change)
		}

		applyNodeChanges(nodeChanges)
	}

	const onEdgesChanges = (edgeChanges: EdgeChange<AudioEdge>[]) => {
		const { applyEdgeChanges, getNodeById, getEdgeById } =
			compositionStore.getState()
		const { applyChange } = editorStore.getState()

		for (const change of edgeChanges) {
			const editorChange = edgeChangeToEditor(
				change,
				getNodeById,
				getEdgeById,
			)

			if (editorChange) {
				applyChange(editorChange)
			}

			updateEdgeSelection(editorStore, change)
		}

		applyEdgeChanges(edgeChanges)
	}

	const onConnect = (connection: Connection) => {
		const { connect } = compositionStore.getState()
		const { applyChange } = editorStore.getState()

		const newEdge = connect(connection)
		if (!newEdge) {
			return
		}

		const { id, source, sourceHandle, target, targetHandle } = newEdge
		applyChange({
			type: 'edge-add',
			id,
			source: [source, parseInt(sourceHandle ?? '0')],
			target: [target, parseInt(targetHandle ?? '0')],
		})
	}

	return (
		<ReactFlow
			id={flowId}
			className="relative"
			nodeTypes={nodeTypes}
			nodes={[...audioNodes.values()]}
			edges={[...audioEdges.values()]}
			onNodesChange={onNodeChanges}
			onEdgesChange={onEdgesChanges}
			onConnect={onConnect}
			onPaneClick={setCursorOnClick}
			colorMode={colorMode}
			nodeOrigin={[0.5, 0.5]}
			proOptions={{ hideAttribution: true }}
			fitView
			fitViewOptions={{ maxZoom: 1, duration: 500 }}
			{...props}
		>
			{isMounted ? (
				<AudioNodeFlowControls />
			) : (
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
					<Loader2Icon className="animate-spin" />
				</div>
			)}
			<Background
				id={backgroundId}
				variant={BackgroundVariant.Dots}
				gap={12}
				size={1}
				className="!bg-neutral-100 dark:!bg-neutral-900"
			/>
			<ViewportPortal>
				<NodeFlowCursor />
			</ViewportPortal>
		</ReactFlow>
	)
}

function updateNodeSelection(
	editorStore: EditorStoreApi,
	compositionStore: CompositionStoreApi,
	change: NodeChange<AudioNode>,
) {
	const { getNodeById } = compositionStore.getState()
	const { selectNodes, selectInstrument, playbackInstrumentId } =
		editorStore.getState()

	switch (change.type) {
		case 'remove': {
			selectNodes('remove', [change.id])
			if (change.id === playbackInstrumentId) {
				selectInstrument(null)
			}
			break
		}

		case 'select': {
			selectNodes(change.selected ? 'add' : 'remove', [change.id])

			const nodeId = change.id
			const { data: { type: nodeType } = { type: null } } =
				getNodeById(nodeId) ?? {}

			if (
				change.selected &&
				nodeType &&
				audioNodeDefinitions[nodeType].group == 'instrument'
			) {
				selectInstrument(nodeId)
			}

			break
		}
	}
}

function updateEdgeSelection(
	editorStore: EditorStoreApi,
	change: EdgeChange<AudioEdge>,
) {
	const { selectEdges } = editorStore.getState()

	switch (change.type) {
		case 'remove': {
			selectEdges('remove', [change.id])
			break
		}

		case 'select': {
			selectEdges(change.selected ? 'add' : 'remove', [change.id])
			break
		}
	}
}
