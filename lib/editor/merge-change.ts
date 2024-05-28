import { shallow } from 'zustand/shallow'
import {
	EditorChange,
	EditorChangeType,
	MAX_HISTORY_LENGTH,
	editorSchemas,
} from '@/lib/schemas/editor'

function editorChangeIs<T extends EditorChangeType>(
	change: EditorChange,
	changeType: T,
): change is EditorChange<T> {
	return change.type == changeType
}

function changeReplacer<H extends EditorChangeType, I extends EditorChangeType>(
	historyType: H,
	incomingType: I,
	condition?: (
		historyChange: EditorChange<H>,
		incomingChange: EditorChange<I>,
	) => boolean,
) {
	return (historyChange: EditorChange, incomingChange: EditorChange) => {
		return (
			editorChangeIs(historyChange, historyType) &&
			editorChangeIs(incomingChange, incomingType) &&
			(!condition || condition(historyChange, incomingChange))
		)
	}
}

const shallowKeys = <T extends {}>(a: T, b: T): boolean =>
	shallow(Object.keys(a), Object.keys(b))

const changeReplacers = [
	changeReplacer('save-changes', 'save-changes'),
	changeReplacer('update', 'update', shallowKeys),
	changeReplacer(
		'node-update',
		'node-update',
		(a, b) =>
			shallowKeys(a, b) &&
			shallowKeys(a.properties ?? {}, b.properties ?? {}),
	),
	changeReplacer('music-layer-update', 'music-layer-update', shallowKeys),
	changeReplacer('music-key-update', 'music-key-update', shallowKeys),
]

export function mergeEditorChange(
	changeHistory: EditorChange[],
	newChange: EditorChange,
): EditorChange[] {
	const parsedChange = editorSchemas.change.safeParse(newChange)
	if (!parsedChange.success) {
		console.warn('invalid composition change', newChange)
		return changeHistory
	}

	newChange = parsedChange.data

	if (!changeHistory.length) {
		return [newChange]
	}

	let historySlice = changeHistory

	const lastChange = changeHistory[changeHistory.length - 1]

	if (changeReplacers.some(c => c(lastChange, newChange))) {
		historySlice = changeHistory.slice(0, changeHistory.length - 1)
	}

	if (historySlice.length > MAX_HISTORY_LENGTH) {
		// TODO: this might throw away very old & unsaved changes
		// ...if you're willing to spam 100+ changes in a row
		historySlice = historySlice.slice(
			historySlice.length - MAX_HISTORY_LENGTH,
			historySlice.length,
		)
	}

	return historySlice.concat(newChange)
}
