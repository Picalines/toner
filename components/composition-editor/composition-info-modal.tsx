'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { useConstant } from '@/lib/hooks'
import { compositionSchemas } from '@/lib/schemas/composition'
import { CompositionStore, EditorStore } from '@/lib/stores'
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
import { useCompositionStoreApi } from '../providers/composition-store-provider'
import {
	useEditorStore,
	useEditorStoreApi,
} from '../providers/editor-store-provider'

const modalSelector = ({ openedModal, closeModal }: EditorStore) => ({
	openedModal,
	closeModal,
})

export default function CompositionInfoModal() {
	const { openedModal, closeModal } = useEditorStore(
		useShallow(modalSelector),
	)

	const onOpenChange = (open: boolean) => {
		if (!open) {
			closeModal()
		}
	}

	return (
		<Dialog
			open={openedModal == 'composition-info'}
			onOpenChange={onOpenChange}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Information</DialogTitle>
				</DialogHeader>
				<UpdateInfoForm />
			</DialogContent>
		</Dialog>
	)
}

const formSchema = z.object({
	name: compositionSchemas.name,
	description: compositionSchemas.description,
})

const infoSelector = ({ name, description }: CompositionStore) => ({
	name,
	description,
})

function UpdateInfoForm() {
	const editorStore = useEditorStoreApi()
	const compositionStore = useCompositionStoreApi()

	const { name, description } = useStore(
		compositionStore,
		useShallow(infoSelector),
	)

	const initialData = useConstant(() => ({
		name,
		description,
	}))

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			...initialData,
		},
		mode: 'onChange',
	})

	const onSubmit = useCallback(
		(data: z.infer<typeof formSchema>) => {
			const { setName, setDescription } = compositionStore.getState()
			const { applyChange } = editorStore.getState()
			const { name, description } = data

			setName(name)
			setDescription(description)
			applyChange({ type: 'update', name, description })
		},
		[compositionStore, editorStore],
	)

	const {
		formState: { isValid, isValidating, isDirty },
	} = form

	useEffect(() => {
		if (!isValidating && isDirty) {
			onSubmit(isValid ? form.getValues() : initialData)
		}
	}, [isValid, isValidating, isDirty, form, onSubmit, initialData])

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
