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
				<span className="relative h-[24px] w-[24px]">
					<Sun className="absolute rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
					<Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />{' '}
				</span>
			) : (
				<Skeleton className="h-[24px] w-[24px] shrink-0 rounded-full" />
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
