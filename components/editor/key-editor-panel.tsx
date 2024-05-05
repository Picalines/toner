'use client'

import KeyAreaBackground from '@/components/editor/key-area-background'
import PianoRoll from '@/components/editor/piano-roll'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export default function KeyEditorPanel() {
	return (
		<ScrollArea className="h-full">
			<div className="relative">
				<PianoRoll className="absolute left-0 w-20" lineHeight={24} />
				<KeyAreaBackground
					className="w-full"
					lineHeight={24}
					numberOfLines={120}
				/>
			</div>
			<ScrollBar orientation="vertical" />
		</ScrollArea>
	)
}
