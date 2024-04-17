'use client'

import { ArrowLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from './ui/button'

type Props = ButtonProps &
	Readonly<{
		defaultHref?: string
	}>

export default function BackButton({
	defaultHref,
	className,
	...buttonProps
}: Props) {
	const router = useRouter()

	const onClick = useCallback(() => {
		if (history.length > 1) {
			router.back()
		} else if (defaultHref) {
			router.replace(defaultHref)
		}
	}, [router, defaultHref])

	return (
		<Button
			{...buttonProps}
			className={cn('space-x-2', className)}
			onClick={onClick}
		>
			<ArrowLeftIcon />
			<span>Back</span>
		</Button>
	)
}
