'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { capitalize } from '@/lib/utils'
import { Button, ButtonProps } from './ui/button'
import { Skeleton } from './ui/skeleton'

export default function ThemeToggle(props: ButtonProps) {
	const { setTheme, theme } = useTheme()
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => setIsMounted(true))

	const toggleTheme = () => {
		setTheme(theme == 'dark' ? 'light' : 'dark')
	}

	return (
		<Button {...props} onClick={toggleTheme}>
			{isMounted ? (
				<span className="relative w-[24px] h-[24px]">
					<Sun className="absolute transition-all scale-100 rotate-0 dark:scale-0 dark:rotate-90" />
					<Moon className="absolute transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0" />{' '}
				</span>
			) : (
				<Skeleton className="w-[24px] h-[24px] rounded-full shrink-0" />
			)}
			{isMounted ? (
				<span>{capitalize(theme ?? '')}</span>
			) : (
				<Skeleton className="h-4 w-full" />
			)}
		</Button>
	)
}
