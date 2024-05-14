'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useShallow } from 'zustand/react/shallow'
import { useConstant } from '@/lib/hooks'
import { compositionSchemas } from '@/schemas/composition'
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
import { CompositionStore } from '@/stores/composition-store'

export default function CompositionInfoModal() {
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

const formCompSelector = ({
	name,
	description,
	setName,
	setDescription,
}: CompositionStore) => ({ name, description, setName, setDescription })

function UpdateInfoForm() {
	const { name, description, setName, setDescription } = useCompositionStore(
		useShallow(formCompSelector),
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
			setName(data.name)
			setDescription(data.description)
		},
		[setName, setDescription],
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