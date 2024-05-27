import { Node, NodeTypes } from '@xyflow/react'
import { MusicKey } from '@/stores/composition-store'
import MusicKeyDisplay from './music-key-display'

export type MusicKeyNode = Node<
	Pick<MusicKey, 'instrumentId' | 'velocity'>,
	'music-key'
>

export const musicNodeTypes = {
	'music-key': MusicKeyDisplay,
} satisfies NodeTypes
