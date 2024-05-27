'use client'

import { useId } from 'react'
import { cn, tw } from '@/lib/utils'
import { EditorStore } from '@/stores/editor-store'
import { useEditorStore } from '../providers/editor-store-provider'

type Props = Readonly<{
	columnWidth?: number
	className?: string
	backgroundClassName?: string
	noteClassName?: string
}>

// TODO: ui mockup, add functionality

const timelineScrollSelector = ({ timelineScroll }: EditorStore) =>
	timelineScroll

export default function EditorTimeline({
	columnWidth = 40,
	className,
	backgroundClassName = tw`fill-background`,
	noteClassName = tw`fill-border`,
}: Props) {
	const patternId = useId() + '-timeline'

	const timelineScroll = useEditorStore(timelineScrollSelector)

	return (
		<div className={cn('overflow-hidden', className)}>
			<svg width="100%" height="100%" overflow="visible">
				<pattern
					id={patternId}
					viewBox="0 0 1 1"
					width={columnWidth}
					height={1}
					patternUnits="userSpaceOnUse"
					preserveAspectRatio="xMaxYMin meet"
				>
					{/* TODO: more divisions */}
					<rect
						x={-columnWidth / 2}
						y={0}
						width={1}
						height={1}
						className={cn('opacity-50', noteClassName)}
					/>
					<rect
						x={0}
						y={0}
						width={1}
						height={1}
						className={noteClassName}
					/>
				</pattern>
				<rect
					x={0}
					y={0}
					width="100%"
					height="100%"
					className={backgroundClassName}
				/>
				<rect
					fill={`url(#${patternId})`}
					x={0}
					y={0}
					width="100%"
					height="100%"
					transform={`translate(${-timelineScroll})`}
				/>
			</svg>
		</div>
	)
}
