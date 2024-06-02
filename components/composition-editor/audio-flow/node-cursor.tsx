import { PlusIcon } from 'lucide-react'
import type { EditorStore } from '@/lib/stores/editor-store'
import { useEditorStore } from '@/components/providers/editor-store-provider'

const cursorSelector = ({ nodeCursor }: EditorStore) => nodeCursor

export default function NodeCursor() {
	const [x, y] = useEditorStore(cursorSelector)

	return (
		<PlusIcon
			className="pointer-events-none relative -z-10 -translate-x-1/2 -translate-y-1/2 scale-[2] opacity-20"
			style={{ left: x + 'px', top: y + 'px' }}
		/>
	)
}
