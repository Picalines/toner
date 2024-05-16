'use client'

import '@xyflow/react/dist/style.css'
import {
	Background,
	BackgroundVariant,
	ColorMode,
	ControlButton,
	Controls,
	ReactFlow,
	ReactFlowProvider,
	ViewportPortal,
	useReactFlow,
} from '@xyflow/react'
import { Loader2Icon, PlusIcon, SquarePlusIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { MouseEvent, useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useIsMountedState } from '@/lib/hooks'
import { CompositionStore } from '@/stores/composition-store'
import { EditorStore } from '@/stores/editor-store'
import { useCompositionStore } from '../providers/composition-store-provider'
import { useEditorStore } from '../providers/editor-store-provider'
import {
	Tooltip,
	TooltipArrow,
	TooltipContent,
	TooltipTrigger,
} from '../ui/tooltip'
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

const editorSelector = ({
	nodeCursor,
	setNodeCursor,
	openModal,
}: EditorStore) => ({
	nodeCursor,
	setNodeCursor,
	openModal,
})

function AudioReactFlow() {
	const reactFlow = useReactFlow()

	const { theme } = useTheme()
	const isMounted = useIsMountedState()

	const colorMode: ColorMode =
		(isMounted ? (theme as ColorMode) : null) ?? 'light'

	const { nodes, edges, applyNodeChanges, applyEdgeChanges, connect } =
		useCompositionStore(useShallow(compositionSelector))

	const { setNodeCursor, openModal } = useEditorStore(
		useShallow(editorSelector),
	)

	const isMouseInsideFlow = useRef(false)

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

	const openAddNode = useCallback(() => openModal('node-add'), [openModal])

	useEffect(() => {
		const onKeyUp = (event: KeyboardEvent) => {
			if (isMouseInsideFlow.current && event.key == 'a') {
				openAddNode()
			}
		}

		document.addEventListener('keyup', onKeyUp)
		return () => document.removeEventListener('keyup', onKeyUp)
	}, [openAddNode])

	return (
		<ReactFlow
			className="relative"
			nodeTypes={nodeTypes}
			nodes={[...nodes.values()]}
			edges={[...edges.values()]}
			onNodesChange={applyNodeChanges}
			onEdgesChange={applyEdgeChanges}
			onConnect={connect}
			onPaneClick={setCursorOnClick}
			onMouseEnter={() => (isMouseInsideFlow.current = true)}
			onMouseLeave={() => (isMouseInsideFlow.current = false)}
			colorMode={colorMode}
			nodeOrigin={[0.5, 0.5]}
			proOptions={{ hideAttribution: true }}
			fitView
			fitViewOptions={{ maxZoom: 1, duration: 500 }}
			multiSelectionKeyCode={null} // TODO: work out bugs with multiple changes
			selectionKeyCode={null}
		>
			{isMounted ? (
				<>
					<Controls showInteractive={false} position="bottom-right" />
					<Controls
						position="top-right"
						showZoom={false}
						showFitView={false}
						showInteractive={false}
					>
						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<ControlButton onClick={openAddNode}>
										<SquarePlusIcon
											className="scale-125"
											style={{ fill: 'none' }}
										/>
									</ControlButton>
								</div>
							</TooltipTrigger>
							<TooltipContent side="left">
								<span>Add Node (A)</span>
								<TooltipArrow />
							</TooltipContent>
						</Tooltip>
					</Controls>
				</>
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
