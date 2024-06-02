'use client'

import { useId } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { EditorStore } from '@/lib/stores/editor-store'
import { cn, tw } from '@/lib/utils'
import { useEditorStore } from '../providers/editor-store-provider'

type Props = Readonly<{
	className?: string
	backgroundClassName?: string
	noteClassName?: string
}>

const TIMELINE_DIVISIONS = 4

const timelineSelector = ({
	timelineNoteWidth,
	timelineScroll,
}: EditorStore) => ({ timelineNoteWidth, timelineScroll })

export default function EditorTimeline({
	className,
	backgroundClassName = tw`fill-background`,
	noteClassName = tw`fill-border`,
}: Props) {
	const patternId = useId() + '-timeline'

	const { timelineNoteWidth, timelineScroll } = useEditorStore(
		useShallow(timelineSelector),
	)

	return (
		<div className={cn('overflow-hidden', className)}>
			<svg width="100%" height="100%" overflow="visible">
				<pattern
					id={patternId}
					viewBox="0 0 1 1"
					x={-timelineScroll}
					width={timelineNoteWidth}
					height={1}
					patternUnits="userSpaceOnUse"
					preserveAspectRatio="xMaxYMin meet"
				>
					{Array.from({ length: TIMELINE_DIVISIONS }).map((_, i) => (
						<rect
							key={i}
							x={(-timelineNoteWidth / TIMELINE_DIVISIONS) * i}
							y={0}
							width={1}
							height={1}
							className={cn(i > 0 && 'opacity-50', noteClassName)}
						/>
					))}
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
				/>
			</svg>
		</div>
	)
}
