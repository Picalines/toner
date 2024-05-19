'use client'

import { useId } from 'react'
import { cn, tw } from '@/lib/utils'

type Props = Readonly<{
	columnWidth?: number
	className?: string
	backgroundClassName?: string
	separatorClassName?: string
}>

// TODO: ui mockup, add functionality

export default function EditorTimeline({
	columnWidth = 40,
	className,
	backgroundClassName = tw`fill-background`,
	separatorClassName = tw`fill-border`,
}: Props) {
	const patternId = useId() + '-timeline'

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
					<rect
						x={0}
						y={0}
						width={1}
						height={1}
						className={separatorClassName}
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
				/>
			</svg>
		</div>
	)
}
