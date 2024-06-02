'use client'

import '@xyflow/react/dist/style.css'
import {
	Background,
	BackgroundVariant,
	type ColorMode,
	ReactFlow,
	type ReactFlowProps,
	ReactFlowProvider,
	SelectionMode,
	ViewportPortal,
	useReactFlow,
} from '@xyflow/react'
import { Loader2Icon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { type MouseEvent, useId, useMemo } from 'react'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import {
	applyFlowEdgeChanges,
	applyFlowNodeChanges,
	connectFlowNodes,
} from '@/lib/editor'
import { useIsMountedState } from '@/lib/hooks'
import type {
	AudioEdge,
	AudioEdgeId,
	AudioNode,
	AudioNodeId,
} from '@/lib/schemas/audio-node'
import type { CompositionStore } from '@/lib/stores/composition-store'
import type { EditorStore } from '@/lib/stores/editor-store'
import { mapIter } from '@/lib/utils'
import { useCompositionStoreApi } from '@/components/providers/composition-store-provider'
import { useEditorStoreApi } from '@/components/providers/editor-store-provider'
import AudioFlowControls from './audio-flow-controls'
import {
	type AudioFlowEdge,
	type AudioFlowNode,
	audioNodeTypes,
} from './audio-node'
import NodeCursor from './node-cursor'

export default function AudioFlow() {
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
	playbackInstrumentId,
}: EditorStore) => ({
	nodeSelection,
	edgeSelection,
	playbackInstrumentId,
})

function AudioReactFlow(props: ReactFlowProps<AudioFlowNode, AudioFlowEdge>) {
	const reactFlow = useReactFlow()
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()

	// NOTE: without unique id the viewport is shared between providers
	const flowId = useId()
	const backgroundId = useId()

	const { audioNodes, audioEdges } = useStore(
		compositionStore,
		useShallow(flowSelector),
	)
	const { nodeSelection, edgeSelection, playbackInstrumentId } = useStore(
		editorStore,
		useShallow(selectionSelector),
	)

	const setCursorOnClick = (event: MouseEvent) => {
		const { x, y } = reactFlow.screenToFlowPosition(
			{
				x: event.clientX,
				y: event.clientY,
			},
			{ snapToGrid: false },
		)
		editorStore.getState().setNodeCursor(x, y)
	}

	const nodes = useMemo(
		() =>
			Array.from(
				mapIter(audioNodes.values(), node =>
					audioNodeToFlowNode(
						node,
						nodeSelection,
						playbackInstrumentId,
					),
				),
			),
		[audioNodes, nodeSelection, playbackInstrumentId],
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

	// TODO: color mode isn't applied after hydration
	const { theme } = useTheme()
	const isMounted = useIsMountedState()
	const colorMode: ColorMode =
		(isMounted ? (theme as ColorMode) : null) ?? 'light'

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
				<AudioFlowControls />
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
				<NodeCursor />
			</ViewportPortal>
		</ReactFlow>
	)
}

function audioNodeToFlowNode(
	audioNode: AudioNode,
	nodeSelection: ReadonlySet<AudioNodeId>,
	playbackInstrumentId: AudioNodeId | null,
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
		selected: nodeSelection.has(id),
		data: {
			label,
			type,
			isPlaybackInstrument: id === playbackInstrumentId,
		},
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
