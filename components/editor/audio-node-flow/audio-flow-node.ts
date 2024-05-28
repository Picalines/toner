import { Edge, Node } from '@xyflow/react'
import { AudioNode } from '@/lib/schemas/audio-node'

export type AudioFlowNode = Node<Pick<AudioNode, 'type' | 'label'>, 'audio'>

export type AudioFlowEdge = Edge<{}>
