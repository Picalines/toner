'use client'

import { RefObject, useEffect, useState } from 'react'

export function useFocus<T extends HTMLElement = HTMLElement>(
	elementRef: RefObject<T>,
	defaultState = false,
) {
	const [isFocused, setIsFocused] = useState(defaultState)

	useEffect(() => {
		const element = elementRef.current
		if (!element) {
			return
		}

		const onFocus = () => setIsFocused(true)
		const onBlur = () => setIsFocused(false)

		element.addEventListener('focus', onFocus)
		element.addEventListener('blur', onBlur)

		return () => {
			element.removeEventListener('focus', onFocus)
			element.removeEventListener('blur', onBlur)
		}
	}, [elementRef])

	return isFocused
}
