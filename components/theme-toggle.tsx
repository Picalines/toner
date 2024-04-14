'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'
import { capitalize, cn } from '@/lib/utils'
import { Button, ButtonProps } from './ui/button'
import { Skeleton } from './ui/skeleton'

type Props = Omit<ButtonProps, 'onClick'> &
	Readonly<{
		toggleVariant?: 'all' | 'iconOnly'
	}>

export default function ThemeToggle({
	toggleVariant = 'all',
	...buttonProps
}: Props) {
	const { setTheme, theme } = useTheme()
	const [isMounted, setIsMounted] = useState(false)

	const toggleTheme = useCallback(() => {
		setTheme(theme == 'dark' ? 'light' : 'dark')
	}, [theme, setTheme])

	useEffect(() => setIsMounted(true), [])

	return (
		<Button
			{...buttonProps}
			className={cn('space-x-2', buttonProps.className)}
			onClick={toggleTheme}
		>
			{isMounted ? (
				<span className="relative w-[24px] h-[24px]">
					<Sun className="absolute transition-all scale-100 rotate-0 dark:scale-0 dark:rotate-90" />
					<Moon className="absolute transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0" />{' '}
				</span>
			) : (
				<Skeleton className="w-[24px] h-[24px] rounded-full shrink-0" />
			)}
			{toggleVariant == 'all' ? (
				isMounted ? (
					<span>{capitalize(theme ?? 'light')}</span>
				) : (
					<Skeleton className="h-4 w-full" />
				)
			) : null}
		</Button>
	)
}
