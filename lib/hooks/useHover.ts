'use client'

import { RefObject, useEffect, useState } from 'react'

export function useHover<T extends HTMLElement = HTMLElement>(
	elementRef: RefObject<T>,
	defaultState = false,
): boolean {
	const [isHovered, setIsHovered] = useState(defaultState)

	useEffect(() => {
		const element = elementRef.current
		if (!element) return

		const onMouseEnter = () => setIsHovered(true)
		const onMouseLeave = () => setIsHovered(false)

		element.addEventListener('mouseenter', onMouseEnter)
		element.addEventListener('mouseleave', onMouseLeave)
		document.addEventListener('mouseleave', onMouseLeave)

		return () => {
			element.removeEventListener('mouseenter', onMouseEnter)
			element.removeEventListener('mouseleave', onMouseLeave)
			document.removeEventListener('mouseleave', onMouseLeave)
		}
	}, [elementRef])

	return isHovered
}
