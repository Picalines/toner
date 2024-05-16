'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { CompositionChangeSummary } from '@/schemas/composition'
import EditorStoreProvider, {
	useEditorStore,
} from '@/components/providers/editor-store-provider'
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { EditorPanelLayout, EditorStore } from '@/stores/editor-store'
import AudioNodeFlow from './audio-node-flow'
import CompositionEditorHeader from './composition-editor-header'
import CompositionInfoModal from './composition-info-modal'
import CreateNodeModal from './create-node-modal'
import MusicKeyEditor from './music-key-editor'
import NodePropertiesEditor from './node-properties-editor'
import { useCompositionChangeWatcher } from './use-composition-change-watcher'
import { useToneEditorWatcher } from './use-tone-editor-watcher'

type Props = Readonly<{
	submitDelay?: number
	panelLayout?: EditorPanelLayout
	className?: string
	onCompositionUpdate?: (
		changeSummary: CompositionChangeSummary,
	) => Promise<void>
}>

export default function CompositionEditor({
	submitDelay = 2000,
	panelLayout = 'horizontal',
	className,
	onCompositionUpdate,
}: Props) {
	return (
		<div
			className={cn(
				'relative flex h-full min-h-0 min-w-0 flex-col',
				className,
			)}
		>
			<EditorStoreProvider
				dirtyState="clean"
				openedModal={null}
				panelLayout={panelLayout}
				nodeCursorX={0}
				nodeCursorY={0}
			>
				<CompositionEditorHeader />
				<CompositionEditorPanels
					submitDelay={submitDelay}
					onCompositionUpdate={onCompositionUpdate}
				/>
				<CompositionInfoModal />
				<CreateNodeModal />
			</EditorStoreProvider>
		</div>
	)
}

type EditorPanelsProps = {
	submitDelay: number
	onCompositionUpdate?: Props['onCompositionUpdate']
}

const panelLayoutSelector = ({ panelLayout }: EditorStore) => panelLayout

function CompositionEditorPanels({
	submitDelay,
	onCompositionUpdate,
}: EditorPanelsProps) {
	useCompositionChangeWatcher({ submitDelay, onCompositionUpdate })

	useToneEditorWatcher()

	const panelLayout = useEditorStore(panelLayoutSelector)

	const nodeEditorDirection =
		panelLayout == 'vertical' ? 'horizontal' : 'vertical'

	return (
		<ResizablePanelGroup
			direction={panelLayout}
			className="flex min-h-0 flex-grow"
		>
			<ResizablePanel defaultSize={50}>
				<MusicKeyEditorPanel />
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
	)
}

function MusicKeyEditorPanel() {
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
			<MusicKeyEditor />
			<ScrollBar orientation="vertical" />
		</ScrollArea>
	)
}
