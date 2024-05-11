'use client'

import '@xyflow/react/dist/style.css'
import {
	Background,
	BackgroundVariant,
	ColorMode,
	Controls,
	ReactFlow,
	ReactFlowProvider,
} from '@xyflow/react'
import { useTheme } from 'next-themes'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
import { CompositionStore } from '@/stores/composition-store'
import { useCompositionStore } from '../providers/composition-store-provider'
import AudioNodeDisplay from './audio-node-display'

type Props = Readonly<{
	className?: string
}>

export default function AudioNodeEditor({ className }: Props) {
	return (
		<div className={cn('h-full w-full', className)}>
			<ReactFlowProvider>
				<AudioFlow />
			</ReactFlowProvider>
		</div>
	)
}

const nodeTypes = { audio: AudioNodeDisplay }

const compositionSelector = (composition: CompositionStore) => ({
	nodes: composition.nodes,
	edges: composition.edges,
	applyNodeChanges: composition.applyNodeChanges,
	applyEdgeChanges: composition.applyEdgeChanges,
	connect: composition.connect,
})

function AudioFlow() {
	const { theme } = useTheme()

	const { nodes, edges, applyNodeChanges, applyEdgeChanges, connect } =
		useCompositionStore(useShallow(compositionSelector))

	return (
		<ReactFlow
			nodeTypes={nodeTypes}
			nodes={nodes}
			edges={edges}
			onNodesChange={applyNodeChanges}
			onEdgesChange={applyEdgeChanges}
			onConnect={connect}
			colorMode={theme as ColorMode}
			proOptions={{ hideAttribution: true }}
			fitView
		>
			<Controls showInteractive={false} position="bottom-right" />
			<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
		</ReactFlow>
	)
}
