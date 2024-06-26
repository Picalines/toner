'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useIsMountedState } from '@/lib/hooks'
import { capitalize, cn } from '@/lib/utils'
import { Button, type ButtonProps } from './ui/button'
import { Skeleton } from './ui/skeleton'

type Props = Omit<ButtonProps, 'children' | 'onClick'> &
	Readonly<{
		themeName?: boolean
	}>

export default function ThemeToggle({
	themeName: showThemeName = true,
	className,
	...buttonProps
}: Props) {
	const { setTheme, theme } = useTheme()
	const isMounted = useIsMountedState()

	const toggleTheme = () => {
		setTheme(theme == 'dark' ? 'light' : 'dark')
	}

	return (
		<Button
			{...buttonProps}
			className={cn('space-x-2', className)}
			onClick={toggleTheme}
		>
			{isMounted ? (
				<span className="relative h-[24px] w-[24px]">
					<Sun className="absolute rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
					<Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				</span>
			) : (
				<Skeleton className="h-[24px] w-[24px] shrink-0 rounded-full" />
			)}
			{showThemeName ? (
				isMounted ? (
					<span>{capitalize(theme ?? 'light')}</span>
				) : (
					<Skeleton className="h-4 w-full" />
				)
			) : null}
		</Button>
	)
}
