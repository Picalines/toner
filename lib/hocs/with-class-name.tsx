import { ElementRef, FunctionComponent, forwardRef } from 'react'
import { cn } from '../utils'

export function withClassName<P extends { className?: string } = {}>(
	Component: FunctionComponent<P>,
	defaultClassName: string,
) {
	const componentWithClassName = forwardRef<ElementRef<typeof Component>, P>(
		(props, ref) => {
			return (
				<Component
					{...props}
					ref={ref}
					className={cn(defaultClassName, props.className)}
				/>
			)
		},
	)

	componentWithClassName.displayName = Component.displayName

	return componentWithClassName
}
