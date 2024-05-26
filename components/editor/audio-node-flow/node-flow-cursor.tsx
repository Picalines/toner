import { PlusIcon } from 'lucide-react'
import { useEditorStore } from '@/components/providers/editor-store-provider'
import { EditorStore } from '@/stores/editor-store'

const cursorSelector = ({ nodeCursor }: EditorStore) => nodeCursor

export default function NodeFlowCursor() {
	const [x, y] = useEditorStore(cursorSelector)

	return (
		<PlusIcon
			className="pointer-events-none relative -z-10 -translate-x-1/2 -translate-y-1/2 scale-[2] opacity-20"
			style={{ left: x + 'px', top: y + 'px' }}
		/>
	)
}
