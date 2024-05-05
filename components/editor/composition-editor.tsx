'use client'

import * as Tone from 'tone'
import { useEditorStore } from '@/components/providers/editor-store-provider'
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable'
import ToneStoreProvider from '../providers/tone-store-provider'
import KeyEditorPanel from './key-editor-panel'

export default function CompositionEditor() {
	const panelLayout = useEditorStore(editor => editor.panelLayout)

	return (
		<ToneStoreProvider
			initialState={{
				context: Tone.getContext(),
				isAudioAvailable: false,
				nodes: [],
			}}
		>
			<ResizablePanelGroup
				direction={panelLayout}
				className="flex flex-grow"
			>
				<ResizablePanel defaultSize={50}>
					<KeyEditorPanel />
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel defaultSize={50}>
					{/* TODO: nodes */}
				</ResizablePanel>
			</ResizablePanelGroup>
		</ToneStoreProvider>
	)
}
