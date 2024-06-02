import { type ComponentProps, memo, useId } from 'react'
import { type PropsWithoutChildren, cn, tw } from '@/lib/utils'

type Props = PropsWithoutChildren<ComponentProps<'div'>> &
	Readonly<{
		lineHeight?: number
		numberOfLines?: number
		separatorClassName?: string
		naturalClassName?: string
		accidentalClassName?: string
	}>

function MusicFlowBackground({
	lineHeight = 16,
	numberOfLines = 12,
	naturalClassName = tw`fill-white dark:fill-neutral-900`,
	accidentalClassName = tw`fill-gray-200 dark:fill-neutral-950`,
	separatorClassName = tw`fill-gray-300 dark:fill-border`,
	className,
}: Props) {
	const patternId = useId() + '-key-bg'

	const accidentalKeys = new Set([1, 3, 5, 8, 10])
	const keyLines = Array.from({ length: 12 }).map((_, index) => ({
		index,
		className: accidentalKeys.has(index)
			? accidentalClassName
			: naturalClassName,
	}))

	const separatorHeight = 0.05

	return (
		<div
			className={cn('overflow-hidden', className)}
			style={{ height: lineHeight * numberOfLines + 'px' }}
		>
			<svg width="100%" height="100%" overflow="visible">
				<pattern
					id={patternId}
					viewBox="0 0 1 12"
					width="100%"
					height={12 * lineHeight}
					patternUnits="userSpaceOnUse"
					preserveAspectRatio="xMinYMin meet"
				>
					{keyLines.map(({ index, className: lineClassName }) => (
						<rect
							key={index}
							x={0}
							y={index + separatorHeight / 2}
							width="100%"
							height={1 - separatorHeight}
							className={lineClassName}
						/>
					))}
				</pattern>
				<rect
					x={0}
					y={0}
					width="100%"
					height="100%"
					className={separatorClassName}
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

export default memo(MusicFlowBackground)
