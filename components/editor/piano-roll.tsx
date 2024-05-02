import { memo } from 'react'
import { cn, range, tw } from '@/lib/utils'

type PianoRollProps = Readonly<{
	minOctave?: number
	maxOctave?: number
	lineHeight?: number
	keyClassName?: string
	naturalKeyClassName?: string
	accidentalKeyClassName?: string
	className?: string
}>

export default function PianoRoll({
	minOctave = 0,
	maxOctave = 9,
	lineHeight = 16,
	keyClassName = tw`rounded-br rounded-tr pr-1 text-right outline outline-2 -outline-offset-1 outline-border filter active:text-opacity-50 dark:active:text-opacity-50`,
	naturalKeyClassName = tw`bg-white text-black active:bg-neutral-100 dark:bg-neutral-600 dark:text-neutral-900 dark:active:bg-neutral-700`,
	accidentalKeyClassName = tw`absolute w-full max-w-[calc(100%-0.5rem-2ch)] bg-neutral-800 text-white dark:bg-neutral-950 dark:text-neutral-500`,
	className,
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
				/>
			))}
		</div>
	)
}

const numberOfKeys = 12
const accidentalKeys = new Set([1, 3, 5, 8, 10])
const stepSizedKeys = new Set([2, 4, 9])
const keyLetters = 'CCDDEFFGGAAB'.split('').reverse()

type PianoRollOctaveProps = Readonly<{
	octave: number
	lineHeight: number
	keyClassName: string
	naturalKeyClassName: string
	accidentalKeyClassName: string
}>

const PianoRollOctave = memo(
	({
		octave,
		lineHeight,
		keyClassName,
		naturalKeyClassName,
		accidentalKeyClassName,
	}: PianoRollOctaveProps) => {
		return (
			<div
				className="relative flex flex-col"
				style={{ height: lineHeight * numberOfKeys }}
			>
				{[...range(numberOfKeys)].map(keyIndex => (
					<button
						key={keyIndex}
						data-letter={keyLetters[keyIndex]}
						className={cn(
							'block flex-grow',
							keyClassName,
							accidentalKeys.has(keyIndex)
								? accidentalKeyClassName
								: naturalKeyClassName,
						)}
						style={{
							maxHeight: stepSizedKeys.has(keyIndex)
								? lineHeight * 2
								: lineHeight * 1.5,
							top: accidentalKeys.has(keyIndex)
								? keyIndex * lineHeight
								: 'auto',
						}}
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
