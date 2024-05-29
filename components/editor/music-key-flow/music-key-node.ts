import { Node, NodeTypes } from '@xyflow/react'
import { MusicKey } from '@/lib/schemas/music'
import MusicKeyDisplay from './music-key-display'

export const musicFlowNodeType = 'music-key'

export type MusicKeyNode = Node<
	Pick<MusicKey, 'instrumentId' | 'velocity'>,
	typeof musicFlowNodeType
>

export const musicNodeTypes = {
	[musicFlowNodeType]: MusicKeyDisplay,
} satisfies NodeTypes
