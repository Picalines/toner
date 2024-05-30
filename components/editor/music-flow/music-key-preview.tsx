import { musicNoteInfo } from '@/lib/music'
import { MAX_MUSIC_NOTE } from '@/lib/schemas/music'
import { useEditorStore } from '@/components/providers/editor-store-provider'
import { Card } from '@/components/ui/card'
import { EditorStore } from '@/stores/editor-store'

type Props = Readonly<{
	lineHeight: number
	semiquaverWidth: number
}>

const previewSelector = ({ musicKeyPreview }: EditorStore) => musicKeyPreview

export default function MusicKeyPreview({
	lineHeight,
	semiquaverWidth,
}: Props) {
	const preview = useEditorStore(previewSelector)

	if (!preview) {
		return null
	}

	const [time, note, duration] = preview

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
