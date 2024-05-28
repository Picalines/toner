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
	SelectionMode,
	ViewportPortal,
	useReactFlow,
} from '@xyflow/react'
import { Loader2Icon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { MouseEvent, useId, useMemo } from 'react'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { edgeChangeToEditor, nodeChangeToEditor } from '@/lib/editor'
import { useIsMountedState } from '@/lib/hooks'
import {
	AudioEdge,
	AudioEdgeId,
	AudioNode,
	AudioNodeId,
	audioNodeDefinitions,
} from '@/lib/schemas/audio-node'
import { mapIter } from '@/lib/utils'
import { useCompositionStoreApi } from '@/components/providers/composition-store-provider'
import { useEditorStoreApi } from '@/components/providers/editor-store-provider'
import {
	CompositionStore,
	CompositionStoreApi,
} from '@/stores/composition-store'
import { EditorStore, EditorStoreApi } from '@/stores/editor-store'
import { AudioFlowEdge, AudioFlowNode } from './audio-flow-node'
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

const selectionSelector = ({ nodeSelection, edgeSelection }: EditorStore) => ({
	nodeSelection,
	edgeSelection,
})

function AudioReactFlow(props: ReactFlowProps<AudioFlowNode, AudioFlowEdge>) {
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

	const { audioNodes, audioEdges } = useStore(
		compositionStore,
		useShallow(flowSelector),
	)
	const { nodeSelection, edgeSelection } = useStore(
		editorStore,
		useShallow(selectionSelector),
	)

	const setCursorOnClick = (event: MouseEvent) => {
		const { x, y } = reactFlow.screenToFlowPosition({
			x: event.clientX,
			y: event.clientY,
		})
		editorStore.getState().setNodeCursor(x, y)
	}

	const onNodeChanges = (nodeChanges: NodeChange<AudioFlowNode>[]) => {
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

	const onEdgesChanges = (edgeChanges: EdgeChange<AudioFlowEdge>[]) => {
		const { applyEdgeChanges, getEdgeById } = compositionStore.getState()
		const { applyChange } = editorStore.getState()

		for (const change of edgeChanges) {
			const editorChange = edgeChangeToEditor(change, getEdgeById)
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

		const { id, source, target, sourceSocket, targetSocket } = newEdge
		applyChange({
			type: 'edge-add',
			id,
			source: [source, sourceSocket],
			target: [target, targetSocket],
		})
	}

	const nodes = useMemo(
		() =>
			Array.from(
				mapIter(audioNodes.values(), node =>
					audioNodeToFlowNode(node, nodeSelection),
				),
			),
		[audioNodes, nodeSelection],
	)

	const edges = useMemo(
		() =>
			Array.from(
				mapIter(audioEdges.values(), edge =>
					audioEdgeToFlowEdge(edge, edgeSelection),
				),
			),
		[audioEdges, edgeSelection],
	)

	return (
		<ReactFlow
			id={flowId}
			className="relative"
			nodeTypes={nodeTypes}
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodeChanges}
			onEdgesChange={onEdgesChanges}
			onConnect={onConnect}
			onPaneClick={setCursorOnClick}
			colorMode={colorMode}
			selectionMode={SelectionMode.Partial}
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

function audioNodeToFlowNode(
	audioNode: AudioNode,
	nodeSelection: AudioNodeId[],
): AudioFlowNode {
	return {
		type: 'audio',
		id: audioNode.id,
		position: { x: audioNode.position[0], y: audioNode.position[1] },
		selected: nodeSelection.includes(audioNode.id),
		deletable: audioNode.type != 'output',
		width: 96,
		height: 64,
		data: {
			label: audioNode.label,
			type: audioNode.type,
		},
	}
}

function audioEdgeToFlowEdge(
	audioEdge: AudioEdge,
	edgeSelection: AudioEdgeId[],
): AudioFlowEdge {
	return {
		type: 'default',
		id: audioEdge.id,
		source: audioEdge.source,
		target: audioEdge.target,
		sourceHandle: String(audioEdge.sourceSocket),
		targetHandle: String(audioEdge.targetSocket),
		selected: edgeSelection.includes(audioEdge.id),
	}
}

function updateNodeSelection(
	editorStore: EditorStoreApi,
	compositionStore: CompositionStoreApi,
	change: NodeChange<AudioFlowNode>,
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
			const { type: nodeType } = getNodeById(nodeId) ?? {}

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
	change: EdgeChange<AudioFlowEdge>,
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
