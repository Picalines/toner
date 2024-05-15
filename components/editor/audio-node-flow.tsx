'use client'

import '@xyflow/react/dist/style.css'
import {
	Background,
	BackgroundVariant,
	ColorMode,
	Controls,
	ReactFlow,
	ReactFlowProvider,
	ViewportPortal,
	useReactFlow,
} from '@xyflow/react'
import { PlusIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { MouseEvent, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { CompositionStore } from '@/stores/composition-store'
import { EditorStore } from '@/stores/editor-store'
import { useCompositionStore } from '../providers/composition-store-provider'
import { useEditorStore } from '../providers/editor-store-provider'
import AudioNodeDisplay from './audio-node-display'

export default function AudioNodeFlow() {
	return (
		<ReactFlowProvider>
			<AudioReactFlow />
		</ReactFlowProvider>
	)
}

const nodeTypes = { audio: AudioNodeDisplay }

const compositionSelector = ({
	nodes,
	edges,
	applyNodeChanges,
	applyEdgeChanges,
	connect,
}: CompositionStore) => ({
	nodes,
	edges,
	applyNodeChanges,
	applyEdgeChanges,
	connect,
})

const editorSelector = ({ nodeCursor, setNodeCursor }: EditorStore) => ({
	nodeCursor,
	setNodeCursor,
})

function AudioReactFlow() {
	const reactFlow = useReactFlow()

	const { theme } = useTheme()

	const {
		nodes: nodes,
		edges,
		applyNodeChanges,
		applyEdgeChanges,
		connect,
	} = useCompositionStore(useShallow(compositionSelector))

	const { setNodeCursor } = useEditorStore(useShallow(editorSelector))

	const setCursorOnClick = useCallback(
		(event: MouseEvent) => {
			const { x, y } = reactFlow.screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			})
			setNodeCursor(x, y)
		},
		[reactFlow, setNodeCursor],
	)

	return (
		<ReactFlow
			nodeTypes={nodeTypes}
			nodes={[...nodes.values()]}
			edges={[...edges.values()]}
			onNodesChange={applyNodeChanges}
			onEdgesChange={applyEdgeChanges}
			onConnect={connect}
			onPaneClick={setCursorOnClick}
			colorMode={theme as ColorMode}
			nodeOrigin={[0.5, 0.5]}
			proOptions={{ hideAttribution: true }}
			fitView
			fitViewOptions={{ maxZoom: 1 }}
			multiSelectionKeyCode={null} // TODO: work out bugs with multiple changes
			selectionKeyCode={null}
		>
			<Controls showInteractive={false} position="bottom-right" />
			<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
			<ViewportPortal>
				<NodeCursor />
			</ViewportPortal>
		</ReactFlow>
	)
}

function NodeCursor() {
	const {
		nodeCursor: [x, y],
	} = useEditorStore(useShallow(editorSelector))

	return (
		<PlusIcon
			className="pointer-events-none relative -z-10 -translate-x-1/2 -translate-y-1/2 scale-[2] opacity-20"
			style={{ left: x + 'px', top: y + 'px' }}
		/>
	)
}
