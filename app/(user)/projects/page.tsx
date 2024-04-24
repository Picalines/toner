import { asc, eq } from 'drizzle-orm'
import { authenticateOrRedirect } from '@/lib/auth'
import { compositionTable, database } from '@/lib/db'
import { getRelativeTimeString } from '@/lib/utils'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

export default async function ProjectsPage() {
	const {
		user: { id: accountId },
	} = await authenticateOrRedirect('/sign-in')

	const compositions = await database
		.select({
			id: compositionTable.id,
			name: compositionTable.name,
			description: compositionTable.description,
			createdAt: compositionTable.createdAt,
		})
		.from(compositionTable)
		.where(eq(compositionTable.authorId, accountId))
		.orderBy(asc(compositionTable.createdAt))

	return (
		<ul className="flex flex-wrap">
			{compositions.map(({ name, description, createdAt }, i) => (
				<Card key={i} className="md:max-w-[400px]">
					<CardHeader>
						<CardTitle>{name}</CardTitle>
						<CardDescription>
							Created {getRelativeTimeString(createdAt)}
						</CardDescription>
					</CardHeader>
					{description.length ? (
						<CardContent>{description}</CardContent>
					) : null}
				</Card>
			))}
		</ul>
	)
}
