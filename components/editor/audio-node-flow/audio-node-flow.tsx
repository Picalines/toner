'use client'

import '@xyflow/react/dist/style.css'
import {
	Background,
	BackgroundVariant,
	ColorMode,
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
import {
	applyFlowEdgeChanges,
	applyFlowNodeChanges,
	connectFlowNodes,
} from '@/lib/editor'
import { useIsMountedState } from '@/lib/hooks'
import {
	AudioEdge,
	AudioEdgeId,
	AudioNode,
	AudioNodeId,
} from '@/lib/schemas/audio-node'
import { mapIter } from '@/lib/utils'
import { useCompositionStoreApi } from '@/components/providers/composition-store-provider'
import { useEditorStoreApi } from '@/components/providers/editor-store-provider'
import { CompositionStore } from '@/stores/composition-store'
import { EditorStore } from '@/stores/editor-store'
import { AudioFlowEdge, AudioFlowNode, audioNodeTypes } from './audio-flow-node'
import AudioNodeFlowControls from './audio-node-flow-controls'
import NodeFlowCursor from './node-flow-cursor'

export default function AudioNodeFlow() {
	return (
		<ReactFlowProvider>
			<AudioReactFlow />
		</ReactFlowProvider>
	)
}

const flowSelector = ({ audioNodes, audioEdges }: CompositionStore) => ({
	audioNodes,
	audioEdges,
})

const selectionSelector = ({
	audioNodeSelection: nodeSelection,
	audioEdgeSelection: edgeSelection,
}: EditorStore) => ({
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
			nodeTypes={audioNodeTypes}
			nodes={nodes}
			edges={edges}
			onNodesChange={applyFlowNodeChanges.bind(
				null,
				compositionStore,
				editorStore,
			)}
			onEdgesChange={applyFlowEdgeChanges.bind(
				null,
				compositionStore,
				editorStore,
			)}
			onConnect={connectFlowNodes.bind(
				null,
				compositionStore,
				editorStore,
			)}
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
	nodeSelection: Set<AudioNodeId>,
): AudioFlowNode {
	const {
		id,
		label,
		type,
		position: [x, y],
	} = audioNode

	return {
		type: 'audio',
		id,
		position: { x, y },
		deletable: type != 'output',
		width: 96,
		height: 64,
		data: { label, type },
		selected: nodeSelection.has(id),
	}
}

function audioEdgeToFlowEdge(
	audioEdge: AudioEdge,
	edgeSelection: Set<AudioEdgeId>,
): AudioFlowEdge {
	const { id, source, target, sourceSocket, targetSocket } = audioEdge
	return {
		type: 'default',
		id,
		source,
		target,
		sourceHandle: String(sourceSocket),
		targetHandle: String(targetSocket),
		selected: edgeSelection.has(id),
	}
}
