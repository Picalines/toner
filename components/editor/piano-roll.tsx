import { ComponentProps, memo } from 'react'
import { cn, range, tw } from '@/lib/utils'

type KeyEvent = {
	note: string
	isAccidental: boolean
	octave: number
	chromaticHalfStep: number
	absoluteHalfStep: number
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

export default function PianoRoll({
	minOctave = 0,
	maxOctave = 9,
	lineHeight = 16,
	keyClassName = tw`rounded-br rounded-tr pr-1 text-right outline outline-2 -outline-offset-1 outline-border filter active:text-opacity-50 dark:active:text-opacity-50`,
	naturalKeyClassName = tw`bg-white text-black active:bg-neutral-100 dark:bg-neutral-600 dark:text-neutral-900 dark:active:bg-neutral-700`,
	accidentalKeyClassName = tw`absolute w-full max-w-[calc(100%-0.5rem-2ch)] bg-neutral-800 text-white dark:bg-neutral-950 dark:text-neutral-500`,
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

const keyLetters = 'CCDDEFFGGAAB'
const numberOfKeys = keyLetters.length
const accidentalKeys = new Set([1, 3, 6, 8, 10])
const stepSizedKeys = new Set([2, 7, 9])

const octaveKeys = [...range(numberOfKeys)].map(keyIndex => ({
	letter: keyLetters[keyIndex],
	isAccidental: accidentalKeys.has(keyIndex),
	lineScale: stepSizedKeys.has(keyIndex) ? 2 : 1.5,
	chromaticHalfStep: keyIndex,
}))

type PianoRollOctaveProps = Readonly<{
	octave: number
	lineHeight: number
	keyClassName: string
	naturalKeyClassName: string
	accidentalKeyClassName: string
	onKeyDown?: (event: KeyEvent) => void
	onKeyUp?: (event: KeyEvent) => void
}>

const PianoRollOctave = memo(
	({
		octave,
		lineHeight,
		keyClassName,
		naturalKeyClassName,
		accidentalKeyClassName,
		onKeyDown,
		onKeyUp,
	}: PianoRollOctaveProps) => {
		const onMouseEvent = (
			button: HTMLButtonElement,
			callbackProp?: (event: KeyEvent) => void,
		) => {
			const {
				letter: note,
				isAccidental,
				chromaticHalfStep,
			} = octaveKeys[parseInt(button.getAttribute('data-index')!)]
			callbackProp?.({
				note,
				isAccidental,
				octave,
				chromaticHalfStep,
				absoluteHalfStep: numberOfKeys * octave + chromaticHalfStep,
			})
		}

		const onMouseDown: ComponentProps<'button'>['onMouseDown'] = event => {
			onMouseEvent(event.target as HTMLButtonElement, onKeyDown)
		}

		const onMouseUp: ComponentProps<'button'>['onMouseUp'] = event => {
			onMouseEvent(event.target as HTMLButtonElement, onKeyUp)
		}

		return (
			<div
				className="relative flex flex-col-reverse"
				style={{ height: lineHeight * numberOfKeys }}
			>
				{octaveKeys.map(({ isAccidental, lineScale }, keyIndex) => (
					<button
						key={keyIndex}
						data-index={keyIndex}
						className={cn(
							'block flex-grow',
							keyClassName,
							isAccidental
								? accidentalKeyClassName
								: naturalKeyClassName,
						)}
						style={{
							maxHeight: lineHeight * lineScale,
							bottom: isAccidental
								? keyIndex * lineHeight
								: 'auto',
						}}
						onMouseDown={onMouseDown}
						onMouseUp={onMouseUp}
					>
						{keyLetters[keyIndex]}
						{octave}
					</button>
				))}
			</div>
		)
	},
)

PianoRollOctave.displayName = 'PianoRollOctave'
