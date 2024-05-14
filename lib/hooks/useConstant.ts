'use client'

import { useRef } from 'react'

export function useConstant<T>(init: () => T): T {
	const ref = useRef<{ value: T } | null>()

	if (!ref.current) {
		ref.current = { value: init() }
	}

	return ref.current.value
}
