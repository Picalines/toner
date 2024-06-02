'use client'

import { ArrowLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { type PropsWithoutChildren, cn } from '@/lib/utils'
import { Button, type ButtonProps } from './ui/button'

type Props = PropsWithoutChildren<ButtonProps> &
	Readonly<{
		defaultHref?: string
		text?: string | null
	}>

export default function BackButton({
	defaultHref,
	text = 'Back',
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
			className={cn('flex flex-row gap-2', className)}
			onClick={onClick}
		>
			<ArrowLeftIcon />
			{text !== null ? <span>{text}</span> : null}
		</Button>
	)
}
