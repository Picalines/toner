'use client'

import { type RefObject, useEffect, useRef } from 'react'

export function useIsMountedRef(): RefObject<boolean> {
	const isMounted = useRef(false)

	useEffect(() => {
		isMounted.current = true
		return () => {
			isMounted.current = false
		}
	}, [])

	return isMounted
}
