import { desc, eq, sql } from 'drizzle-orm'
import type { User } from 'lucia'
import { Loader2Icon, PlusCircleIcon } from 'lucide-react'
import { Suspense } from 'react'
import { compositionTable, database } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { createComposition } from './create-composition'
import EditCompositionLink from './edit-composition-link'

type Props = Readonly<{
	accountId: User['id']
}>

export default function ProjectsSection({ accountId }: Props) {
	return (
		<div className="space-y-2 p-2">
			<h1 className="flex w-full flex-row items-center justify-between gap-2 text-2xl font-medium">
				<span>Projects</span>
				<form action={createComposition}>
					<Button variant="outline" className="space-x-2 p-2">
						<PlusCircleIcon />
						<span>Create new</span>
					</Button>
				</form>
			</h1>
			<Suspense fallback={<ProjectListFallback />}>
				<ProjectList accountId={accountId} />
			</Suspense>
		</div>
	)
}

async function ProjectList({ accountId }: { accountId: User['id'] }) {
	const compositions = await database
		.select({
			id: compositionTable.id,
			name: compositionTable.name,
			description: compositionTable.description,
			createdAt: compositionTable.createdAt,
			updatedAt: compositionTable.updatedAt,
		})
		.from(compositionTable)
		.where(eq(compositionTable.authorId, accountId))
		.orderBy(
			desc(
				sql`CASE WHEN ${compositionTable.updatedAt} IS NOT NULL THEN ${compositionTable.updatedAt} ELSE ${compositionTable.createdAt} END`,
			),
		)

	return compositions.length > 0 ? (
		<div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
			{compositions.map((composition, i) => (
				<EditCompositionLink key={i} {...composition} />
			))}
		</div>
	) : (
		<div className="flex h-36 w-full items-center justify-center rounded-lg border border-dashed">
			Your projects will be here!
		</div>
	)
}

function ProjectListFallback() {
	return (
		<div className="flex h-36 w-full items-center justify-center rounded-lg">
			<Loader2Icon className="animate-spin" />
		</div>
	)
}
