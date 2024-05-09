'use client'

import { Loader2Icon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useIsMountedState } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/components/providers/editor-store-provider'
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import AudioNodeEditor from './audio-node-editor'
import KeyEditor from './key-editor'

type Props = Readonly<{
	className?: string
}>

export default function CompositionEditor({ className }: Props) {
	const isMounted = useIsMountedState()

	const panelLayout = useEditorStore(editor => editor.panelLayout)

	return (
		<div className={cn('relative min-h-0 min-w-0', className)}>
			{isMounted ? (
				<ResizablePanelGroup
					direction={panelLayout}
					className="flex h-full w-full flex-grow"
				>
					<ResizablePanel defaultSize={50}>
						<KeyEditorPanel />
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel defaultSize={50}>
						<AudioNodeEditor />
					</ResizablePanel>
				</ResizablePanelGroup>
			) : (
				<div className="absolute inset-0 bg-neutral-900">
					<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
						<Loader2Icon className="animate-spin" />
					</div>
				</div>
			)}
		</div>
	)
}

function KeyEditorPanel() {
	const keyPanelViewport = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const viewport = keyPanelViewport.current
		if (viewport) {
			viewport.scrollTop =
				viewport.scrollHeight / 2 - viewport.clientHeight / 2
		}
	}, [keyPanelViewport])

	return (
		<ScrollArea viewportRef={keyPanelViewport} className="h-full">
			<KeyEditor />
			<ScrollBar orientation="vertical" />
		</ScrollArea>
	)
}
