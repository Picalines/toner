import { PropsWithChildren } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function EditorLayout({ children }: PropsWithChildren) {
	return (
		<main>
			<TooltipProvider>{children}</TooltipProvider>
		</main>
	)
}
