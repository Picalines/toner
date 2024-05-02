'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'
import { useCompositionStore } from '@/components/providers/composition-store-provider'
import { useEditorStore } from '@/components/providers/editor-store-provider'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { TextArea } from '@/components/ui/text-area'
import { updateCompositionInfo } from './actions'
import { compositionInfoSchema } from './schemas'

export default function UpdateInfoModal() {
	const openedModal = useEditorStore(editor => editor.openedModal)
	const closeModal = useEditorStore(editor => editor.closeModal)

	const onOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				closeModal()
			}
		},
		[closeModal],
	)

	return (
		<Dialog open={openedModal == 'updateInfo'} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Information</DialogTitle>
				</DialogHeader>
				<UpdateInfoForm />
			</DialogContent>
		</Dialog>
	)
}

function UpdateInfoForm() {
	const compositionId = useCompositionStore(composition => composition.id)
	const compositionName = useCompositionStore(composition => composition.name)
	const compositionDescription = useCompositionStore(
		composition => composition.description,
	)
	const updateInfo = useCompositionStore(
		composition => composition.updateInfo,
	)

	const form = useForm({
		resolver: zodResolver(compositionInfoSchema),
		defaultValues: {
			name: compositionName,
			description: compositionDescription,
		},
		mode: 'onChange',
	})

	const handleSubmit = useDebouncedCallback(
		form.handleSubmit(async newInfo => {
			await updateCompositionInfo(compositionId, newInfo)
			updateInfo(newInfo)
		}),
		500,
	)

	const {
		formState: { isValidating, isValid, isDirty },
	} = form

	useEffect(() => {
		if (isDirty && !isValidating && isValid) {
			void handleSubmit()
		}
	}, [isValidating, isValid, isDirty, handleSubmit])

	useEffect(() => () => handleSubmit.flush(), [handleSubmit])

	return (
		<Form {...form}>
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem className="space-y-1">
						<FormLabel>Composition name</FormLabel>
						<FormControl>
							<Input placeholder="name" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
					<FormItem className="space-y-1">
						<FormLabel>Description</FormLabel>
						<FormControl>
							<TextArea placeholder="description" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</Form>
	)
}
