import { Controls as ReactFlowControls, useReactFlow } from '@xyflow/react'
import {
	MaximizeIcon,
	SquareActivityIcon,
	ZoomInIcon,
	ZoomOutIcon,
} from 'lucide-react'
import { type ComponentProps, type FunctionComponent, memo } from 'react'
import type { EditorStore } from '@/lib/stores/editor-store'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/components/providers/editor-store-provider'
import { Button } from '@/components/ui/button'
import {
	Tooltip,
	TooltipArrow,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'

const modalSelector = ({ openModal }: EditorStore) => openModal

function AudioFlowControls() {
	const { zoomIn, zoomOut, fitView } = useReactFlow()

	const openModal = useEditorStore(modalSelector)

	return (
		<>
			<Controls position="top-right">
				<ControlButton
					Icon={SquareActivityIcon}
					onClick={openModal.bind(null, 'node-add')}
					tooltip="Add Node (A)"
				/>
			</Controls>
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
					onClick={() => fitView()} // TODO: doesn't work sometimes
					tooltip="Fit view"
				/>
			</Controls>
		</>
	)
}

export default memo(AudioFlowControls)

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
