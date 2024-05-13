'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import * as React from 'react'
import { cn } from '@/lib/utils'

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> &
	Readonly<{
		thumb?: boolean
		trackClassName?: string
		rangeClassName?: string
	}>

const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	SliderProps
>(
	(
		{ className, trackClassName, rangeClassName, thumb = true, ...props },
		ref,
	) => (
		<SliderPrimitive.Root
			ref={ref}
			className={cn(
				'relative flex h-2 w-full touch-none select-none items-center',
				className,
			)}
			{...props}
		>
			<SliderPrimitive.Track
				className={cn(
					'relative h-full w-full grow overflow-hidden rounded-full bg-secondary',
					trackClassName,
				)}
			>
				<SliderPrimitive.Range
					className={cn('absolute h-full bg-primary', rangeClassName)}
				/>
			</SliderPrimitive.Track>
			{thumb ? (
				<SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
			) : null}
		</SliderPrimitive.Root>
	),
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
