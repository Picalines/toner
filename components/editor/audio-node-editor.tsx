'use client'

import '@xyflow/react/dist/style.css'
import {
	Background,
	BackgroundVariant,
	ColorMode,
	Connection,
	Controls,
	EdgeChange,
	NodeChange,
	ReactFlow,
	ReactFlowProvider,
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
} from '@xyflow/react'
import { useTheme } from 'next-themes'
import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

const initialNodes = [
	{ id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
	{ id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
]

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }]

type AudioNode = typeof initialNodes extends (infer I)[] ? I : never

type AudioEdge = typeof initialEdges extends (infer I)[] ? I : never

type Props = Readonly<{
	className?: string
}>

export default function AudioNodeEditor({ className }: Props) {
	return (
		<div className={cn('h-full w-full', className)}>
			<ReactFlowProvider>
				<Flow />
			</ReactFlowProvider>
		</div>
	)
}

function Flow() {
	const { theme } = useTheme()

	const [nodes, setNodes] = useState(initialNodes)
	const [edges, setEdges] = useState(initialEdges)

	const onNodesChange = useCallback(
		(changes: NodeChange<AudioNode>[]) =>
			setNodes(n => applyNodeChanges(changes, n)),
		[],
	)

	const onEdgesChange = useCallback(
		(changes: EdgeChange<AudioEdge>[]) =>
			setEdges(e => applyEdgeChanges(changes, e)),
		[],
	)

	const onConnect = useCallback(
		(edgeParams: Connection) => setEdges(e => addEdge(edgeParams, e)),
		[],
	)

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			colorMode={theme as ColorMode}
			proOptions={{ hideAttribution: true }}
			fitView
		>
			<Controls showInteractive={false} position="bottom-right" />
			<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
		</ReactFlow>
	)
}
