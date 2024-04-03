import { Loader2 } from 'lucide-react'
import React, { PropsWithChildren, Suspense } from 'react'
import ActivitySidebar from '@/components/activity-sidebar'

export default function UserLayout({ children }: PropsWithChildren) {
	return (
		<div className="flex flex-row w-full h-[100svh]">
			<ActivitySidebar />
			<main className="relative w-full">
				<Suspense
					fallback={
						<Loader2 className="h-6 w-6 animate-spin absolute top-1/2 left-1/2" />
					}
				>
					{children}
				</Suspense>
			</main>
		</div>
	)
}
