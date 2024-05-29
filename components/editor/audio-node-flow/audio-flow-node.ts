import { Edge, Node, NodeTypes } from '@xyflow/react'
import { AudioNode } from '@/lib/schemas/audio-node'
import AudioNodeDisplay from './audio-node-display'

export const audioFlowNodeType = 'audio'

export type AudioFlowNode = Node<
	Pick<AudioNode, 'type' | 'label'>,
	typeof audioFlowNodeType
>

export type AudioFlowEdge = Edge<{}>

export const audioNodeTypes = {
	[audioFlowNodeType]: AudioNodeDisplay,
} satisfies NodeTypes
