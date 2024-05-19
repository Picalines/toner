'use client'

import '@xyflow/react/dist/style.css'
import {
	Background,
	BackgroundVariant,
	ColorMode,
	ReactFlow,
	Controls as ReactFlowControls,
	ReactFlowProvider,
	ViewportPortal,
	useReactFlow,
} from '@xyflow/react'
import {
	Loader2Icon,
	MaximizeIcon,
	PlusIcon,
	SquareActivityIcon,
	ZoomInIcon,
	ZoomOutIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import {
	ComponentProps,
	FunctionComponent,
	MouseEvent,
	useCallback,
	useEffect,
	useRef,
} from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useIsMountedState } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { CompositionStore } from '@/stores/composition-store'
import { EditorStore } from '@/stores/editor-store'
import { useCompositionStore } from '../providers/composition-store-provider'
import { useEditorStore } from '../providers/editor-store-provider'
import { Button } from '../ui/button'
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

	const setCursorOnClick = (event: MouseEvent) => {
		const { x, y } = reactFlow.screenToFlowPosition({
			x: event.clientX,
			y: event.clientY,
		})
		setNodeCursor(x, y)
	}

	const onKeyUp = useCallback(
		(event: KeyboardEvent) => {
			if (isMouseInsideFlow.current && event.key == 'a') {
				openModal('node-add')
			}
		},
		[openModal],
	)

	useEffect(() => {
		document.addEventListener('keyup', onKeyUp)
		return () => document.removeEventListener('keyup', onKeyUp)
	}, [onKeyUp])

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
					<ViewportControls />
					<Controls position="top-right">
						<ControlButton
							Icon={SquareActivityIcon}
							onClick={() => openModal('node-add')}
							tooltip="Add Node (A)"
						/>
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

// TODO: memoization
function ViewportControls() {
	const { zoomIn, zoomOut, fitView } = useReactFlow()

	return (
		<Controls position="bottom-right">
			<ControlButton
				Icon={ZoomInIcon}
				onClick={() => zoomIn()}
				tooltip="Zoom in"
			/>
			<ControlButton
				Icon={ZoomOutIcon}
				onClick={() => zoomOut()}
				tooltip="Zoom out"
			/>
			<ControlButton
				Icon={MaximizeIcon}
				onClick={() => fitView()}
				tooltip="Fit view"
			/>
		</Controls>
	)
}

function Controls({
	children,
	...props
}: ComponentProps<typeof ReactFlowControls>) {
	return (
		<ReactFlowControls
			showZoom={false}
			showFitView={false}
			showInteractive={false}
			position="bottom-right"
			className="gap-1 drop-shadow-sm"
			style={{ boxShadow: 'none' }}
			{...props}
		>
			{children}
		</ReactFlowControls>
	)
}

type ControlButtonProps = Omit<ComponentProps<typeof Button>, 'children'> &
	Readonly<{
		Icon: FunctionComponent
		tooltip: string
	}>

function ControlButton({
	Icon,
	tooltip,
	className,
	...buttonProps
}: ControlButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="outline"
					{...buttonProps}
					className={cn('h-min w-min p-1', className)}
				>
					<Icon />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="left">
				<span>{tooltip}</span>
				<TooltipArrow />
			</TooltipContent>
		</Tooltip>
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
