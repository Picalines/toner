import { useShallow } from 'zustand/react/shallow'
import { musicNoteInfo } from '@/lib/music'
import { MAX_MUSIC_NOTE } from '@/lib/schemas/music'
import type { EditorStore } from '@/lib/stores/editor-store'
import { useEditorStore } from '@/components/providers/editor-store-provider'
import { Card } from '@/components/ui/card'

const previewSelector = ({
	musicKeyPreview: preview,
	noteLineHeight: lineHeight,
	timelineNoteWidth: noteWidth,
}: EditorStore) => ({ preview, lineHeight, noteWidth })

export default function MusicKeyPreview() {
	const { preview, lineHeight, noteWidth } = useEditorStore(
		useShallow(previewSelector),
	)

	if (!preview) {
		return null
	}

	const semiquaverWidth = noteWidth / 16

	const { time, note, duration } = preview

	const { symbol, octave } = musicNoteInfo(note)

	return (
		<Card
			className="relative -z-10 rounded-sm border-2 border-dashed border-white bg-transparent pl-[2px] opacity-30"
			style={{
				height: lineHeight + 'px',
				width: duration * semiquaverWidth + 'px',
				left: time * semiquaverWidth + 'px',
				top: (MAX_MUSIC_NOTE - note) * lineHeight + 'px',
			}}
		>
			{symbol[0] + octave}
		</Card>
	)
}
