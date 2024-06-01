'use client'

import { useEffect, useId, useRef } from 'react'
import { EditorChangeSummary } from '@/lib/schemas/editor'
import { EditorPanelLayout, EditorStore } from '@/lib/stores'
import { useToneCompositionInitializer, useToneEditorWatcher } from '@/lib/tone'
import { cn } from '@/lib/utils'
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import EditorStoreProvider, {
	useEditorStore,
} from '../providers/editor-store-provider'
import AudioFlow from './audio-flow'
import CompositionEditorHeader from './composition-editor-header'
import CompositionInfoModal from './composition-info-modal'
import CreateNodeModal from './create-node-modal'
import MusicEditor from './music-editor'
import NodePropertiesEditor from './node-properties-editor'
import { useCompositionChangeWatcher } from './use-composition-change-watcher'

type Props = Readonly<{
	submitDelay?: number
	panelLayout?: EditorPanelLayout
	className?: string
	onCompositionUpdate?: (changeSummary: EditorChangeSummary) => Promise<void>
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
			<EditorStoreProvider panelLayout={panelLayout}>
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
	useToneCompositionInitializer()
	useToneEditorWatcher()

	const panelLayout = useEditorStore(panelLayoutSelector)

	const nodeEditorDirection =
		panelLayout == 'vertical' ? 'horizontal' : 'vertical'

	const reverseAudioGroup = panelLayout == 'horizontal'

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
				<ResizablePanelGroup
					direction={nodeEditorDirection}
					className={cn(reverseAudioGroup && '!flex-col-reverse')}
				>
					<ResizablePanel
						id={useId()}
						order={reverseAudioGroup ? 2 : 1}
						defaultSize={30}
					>
						<NodePropertiesEditor className="h-full" />
					</ResizablePanel>
					<ResizableHandle />
					<ResizablePanel
						id={useId()}
						order={reverseAudioGroup ? 1 : 2}
						defaultSize={70}
					>
						<AudioFlow />
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
			<MusicEditor />
			<ScrollBar orientation="vertical" />
		</ScrollArea>
	)
}
