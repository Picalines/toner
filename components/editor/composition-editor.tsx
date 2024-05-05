'use client'

import { useEditorStore } from '@/components/providers/editor-store-provider'
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable'
import KeyEditorPanel from './key-editor-panel'

export default function CompositionEditor() {
	const panelLayout = useEditorStore(editor => editor.panelLayout)

	return (
		<ResizablePanelGroup direction={panelLayout} className="flex flex-grow">
			<ResizablePanel defaultSize={50}>
				<KeyEditorPanel />
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={50}>
				{/* TODO: nodes */}
			</ResizablePanel>
		</ResizablePanelGroup>
	)
}
