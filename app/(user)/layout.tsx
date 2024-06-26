import { Loader2 } from 'lucide-react'
import React, { type PropsWithChildren, type ReactNode, Suspense } from 'react'
import ActivitySidebar from '@/components/activity-sidebar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TooltipProvider } from '@/components/ui/tooltip'

type Props = Readonly<PropsWithChildren & { modal: ReactNode }>

export default function UserLayout({ children, modal }: Props) {
	return (
		<div className="flex h-[100svh] w-full flex-row">
			<TooltipProvider>
				<ActivitySidebar />
				<ScrollArea className="w-full">
					<main className="relative h-[100svh] w-full">
						<Suspense
							fallback={
								<Loader2 className="absolute left-1/2 top-1/2 h-6 w-6 animate-spin" />
							}
						>
							{children}
						</Suspense>
					</main>
					<ScrollBar orientation="vertical" />
				</ScrollArea>
				{modal}
			</TooltipProvider>
		</div>
	)
}
