'use client'

import { useId } from 'react'
import { EditorStore } from '@/lib/stores'
import { cn, tw } from '@/lib/utils'
import { useEditorStore } from '../providers/editor-store-provider'

type Props = Readonly<{
	columnWidth?: number
	className?: string
	backgroundClassName?: string
	noteClassName?: string
}>

const TIMELINE_DIVISIONS = 4

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
					x={-timelineScroll}
					width={columnWidth}
					height={1}
					patternUnits="userSpaceOnUse"
					preserveAspectRatio="xMaxYMin meet"
				>
					{Array.from({ length: TIMELINE_DIVISIONS }).map((_, i) => (
						<rect
							key={i}
							x={(-columnWidth / TIMELINE_DIVISIONS) * i}
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
