import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

function Skeleton({ className, ...divProps }: ComponentProps<'div'>) {
	return (
		<div
			className={cn('animate-pulse rounded-md bg-muted', className)}
			{...divProps}
		/>
	)
}

export { Skeleton }
