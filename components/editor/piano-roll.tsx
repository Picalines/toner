import { MouseEvent, MouseEventHandler, memo } from 'react'
import { cn, range, tw } from '@/lib/utils'
import { MAX_OCTAVE, OCTAVE_LENGTH, musicNoteInfo } from '@/schemas/music'

export type KeyEvent = {
	note: number
}

type PianoRollProps = Readonly<{
	minOctave?: number
	maxOctave?: number
	lineHeight?: number
	keyClassName?: string
	naturalKeyClassName?: string
	accidentalKeyClassName?: string
	className?: string
	onKeyDown?: (event: KeyEvent) => void
	onKeyUp?: (event: KeyEvent) => void
}>

export function PianoRoll({
	minOctave = 0,
	maxOctave = MAX_OCTAVE,
	lineHeight = 16,
	keyClassName = tw`select-none rounded-br rounded-tr pr-1 text-right outline outline-2 -outline-offset-1 outline-border [&.down]:text-opacity-50`,
	naturalKeyClassName = tw`bg-white text-black dark:bg-neutral-600 dark:text-neutral-900 [&.down]:bg-neutral-100 dark:[&.down]:bg-neutral-700`,
	accidentalKeyClassName = tw`bg-neutral-800 text-white dark:bg-neutral-950 dark:text-neutral-500`,
	className,
	onKeyDown,
	onKeyUp,
}: PianoRollProps) {
	return (
		<div className={className}>
			{[...range(maxOctave, minOctave - 1, -1)].map(octave => (
				<PianoRollOctave
					key={octave}
					octave={octave}
					lineHeight={lineHeight}
					keyClassName={keyClassName}
					naturalKeyClassName={naturalKeyClassName}
					accidentalKeyClassName={accidentalKeyClassName}
					onKeyDown={onKeyDown}
					onKeyUp={onKeyUp}
				/>
			))}
		</div>
	)
}

export default memo(PianoRoll)

const stepSizedKeys = new Set([2, 7, 9])

const octaveKeys = [...range(OCTAVE_LENGTH)].map(keyIndex => {
	const { symbol, accidental } = musicNoteInfo(keyIndex)
	return {
		letter: symbol[0],
		accidental,
		lineScale: stepSizedKeys.has(keyIndex) ? 2 : 1.5,
	}
})

type PianoRollOctaveProps = Readonly<{
	octave: number
	lineHeight: number
	keyClassName: string
	naturalKeyClassName: string
	accidentalKeyClassName: string
	onKeyDown?: (event: KeyEvent) => void
	onKeyUp?: (event: KeyEvent) => void
}>

function PianoRollOctave({
	octave,
	lineHeight,
	keyClassName,
	naturalKeyClassName,
	accidentalKeyClassName,
	onKeyDown,
	onKeyUp,
}: PianoRollOctaveProps) {
	const onMouseEvent = (event: MouseEvent, isDown: boolean) => {
		event.preventDefault()
		const button = event.target as HTMLButtonElement
		const keyIndex = parseInt(button.getAttribute('data-index')!)
		if (isNaN(keyIndex)) {
			return
		}

		const callbackProp = isDown ? onKeyDown : onKeyUp
		callbackProp?.({ note: octave * OCTAVE_LENGTH + keyIndex })
		button.classList.toggle('down', isDown)
	}

	const onMouseDown: MouseEventHandler<HTMLDivElement> = event =>
		onMouseEvent(event, true)

	const onMouseUp: MouseEventHandler<HTMLDivElement> = event =>
		onMouseEvent(event, false)

	const onMouseEnterKey: MouseEventHandler<HTMLButtonElement> = event => {
		if (event.buttons > 0) {
			onMouseEvent(event, true)
			;(event.target as HTMLElement).classList.add('down')
		}
	}

	const onMouseLeaveKey: MouseEventHandler<HTMLButtonElement> = event => {
		if (event.buttons > 0) onMouseEvent(event, false)
		;(event.target as HTMLElement).classList.remove('down')
	}

	return (
		<div
			className="relative flex flex-col-reverse"
			style={{ height: lineHeight * OCTAVE_LENGTH }}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
		>
			{octaveKeys.map(({ letter, accidental, lineScale }, keyIndex) => (
				<button
					key={keyIndex}
					data-index={keyIndex}
					className={cn(
						'block flex-grow',
						keyClassName,
						accidental
							? cn(
									'absolute w-full max-w-[max(2.5ch+0.5rem,calc(100%-0.5rem-2.5ch))]',
									accidentalKeyClassName,
								)
							: naturalKeyClassName,
					)}
					style={{
						maxHeight: lineHeight * lineScale,
						bottom: accidental ? keyIndex * lineHeight : 'auto',
					}}
					onMouseEnter={onMouseEnterKey}
					onMouseLeave={onMouseLeaveKey}
				>
					{letter}
					{octave}
				</button>
			))}
		</div>
	)
}
