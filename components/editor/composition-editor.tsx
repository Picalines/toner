'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/components/providers/editor-store-provider'
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import AudioNodeFlow from './audio-node-flow'
import CompositionInfoModal from './composition-info-modal'
import CreateNodeModal from './create-node-modal'
import KeyEditor from './key-editor'
import NodePropertiesEditor from './node-properties-editor'
import { useToneEditorWatcher } from './use-tone-editor-watcher'

type Props = Readonly<{
	className?: string
}>

export default function CompositionEditor({ className }: Props) {
	const panelLayout = useEditorStore(editor => editor.panelLayout)

	const nodeEditorDirection =
		panelLayout == 'vertical' ? 'horizontal' : 'vertical'

	useToneEditorWatcher()

	return (
		<div className={cn('relative min-h-0 min-w-0', className)}>
			<ResizablePanelGroup
				direction={panelLayout}
				className="flex h-full w-full flex-grow"
			>
				<ResizablePanel defaultSize={50}>
					<KeyEditorPanel />
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel defaultSize={50}>
					<ResizablePanelGroup direction={nodeEditorDirection}>
						<ResizablePanel defaultSize={30}>
							<NodePropertiesEditor className="h-full" />
						</ResizablePanel>
						<ResizableHandle withHandle />
						<ResizablePanel defaultSize={70}>
							<AudioNodeFlow />
						</ResizablePanel>
					</ResizablePanelGroup>
				</ResizablePanel>
			</ResizablePanelGroup>
			<CompositionInfoModal />
			<CreateNodeModal />
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
