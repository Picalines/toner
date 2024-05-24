'use client'

import '@xyflow/react/dist/style.css'
import {
	Background,
	BackgroundVariant,
	ColorMode,
	Connection,
	EdgeChange,
	NodeChange,
	ReactFlow,
	ReactFlowProvider,
	ViewportPortal,
	useReactFlow,
} from '@xyflow/react'
import { Loader2Icon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { MouseEvent } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useIsMountedState } from '@/lib/hooks'
import { audioNodeDefinitions } from '@/schemas/audio-node'
import {
	AudioEdge,
	AudioNode,
	CompositionStore,
} from '@/stores/composition-store'
import {
	useCompositionStore,
	useCompositionStoreApi,
} from '../providers/composition-store-provider'
import { useEditorStoreApi } from '../providers/editor-store-provider'
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

const nodeTypes = { audio: AudioNodeDisplay }

const flowSelector = ({ audioNodes, audioEdges }: CompositionStore) => ({
	audioNodes,
	audioEdges,
})

function AudioReactFlow() {
	const reactFlow = useReactFlow()
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()

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
		const { selectNodes, selectInstrument, playbackInstrumentId } =
			editorStore.getState()

		applyNodeChanges(nodeChanges)

		for (const change of nodeChanges) {
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
	}

	const onEdgesChanges = (edgeChanges: EdgeChange<AudioEdge>[]) => {
		const { applyEdgeChanges } = compositionStore.getState()
		const { selectEdges } = editorStore.getState()
		applyEdgeChanges(edgeChanges)
		for (const change of edgeChanges) {
			if (change.type == 'select') {
				selectEdges(change.selected ? 'add' : 'remove', [change.id])
			}
		}
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
		>
			{isMounted ? (
				<AudioNodeFlowControls />
			) : (
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
					<Loader2Icon className="animate-spin" />
				</div>
			)}
			<Background
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
