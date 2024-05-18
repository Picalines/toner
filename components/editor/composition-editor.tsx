'use client'

import { useEffect, useRef } from 'react'
import { cn, takeFirst } from '@/lib/utils'
import { AudioNodeId, audioNodeDefinitions } from '@/schemas/audio-node'
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
import { AudioNode } from '@/stores/composition-store'
import { EditorPanelLayout, EditorStore } from '@/stores/editor-store'
import { useCompositionStoreApi } from '../providers/composition-store-provider'
import AudioNodeFlow from './audio-node-flow'
import CompositionEditorHeader from './composition-editor-header'
import CompositionInfoModal from './composition-info-modal'
import CreateNodeModal from './create-node-modal'
import MusicKeyEditor from './music-key-editor'
import NodePropertiesEditor from './node-properties-editor'
import { useCompositionChangeWatcher } from './use-composition-change-watcher'
import { useSelectedInstrumentWatcher } from './use-selected-instrument-watcher'
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
	const { nodes: audioNodes, musicLayers } =
		useCompositionStoreApi().getState()

	return (
		<div
			className={cn(
				'relative flex h-full min-h-0 min-w-0 flex-col',
				className,
			)}
		>
			<EditorStoreProvider
				panelLayout={panelLayout}
				selectedInstrumentId={findAnyInstrumentNodeId(audioNodes)}
				selectedMusicLayerId={takeFirst(musicLayers.keys()) ?? ''}
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
	useSelectedInstrumentWatcher()
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
					<ResizableHandle />
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

function findAnyInstrumentNodeId(
	audioNodes: Map<AudioNodeId, AudioNode>,
): AudioNodeId | null {
	for (const node of audioNodes.values()) {
		const {
			id: nodeId,
			data: { type: nodeType },
		} = node

		if (audioNodeDefinitions[nodeType].group == 'instrument') {
			return nodeId
		}
	}

	return null
}
