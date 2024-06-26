import { authenticateOrRedirect } from '@/lib/auth'
import { Separator } from '@/components/ui/separator'
import ProfileSection from './profile-section'
import ProjectsSection from './projects-section'

export default async function AccountPage() {
	const { user } = await authenticateOrRedirect('/sign-in')

	return (
		<div className="p-2">
			<ProfileSection {...user} />
			<Separator className="mb-2 mt-2" />
			<ProjectsSection accountId={user.id} />
		</div>
	)
}
