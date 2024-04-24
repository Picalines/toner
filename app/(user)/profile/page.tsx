import { authenticateOrRedirect } from '@/lib/auth'
import BackButton from '@/components/back-button'
import { Separator } from '@/components/ui/separator'
import EditProfileForm from './form'

export default async function EditProfilePage() {
	const { user } = await authenticateOrRedirect('/sign-in')

	return (
		<div className="max-w-[800px] space-y-2 p-4">
			<h1 className="flex items-center gap-2 text-2xl font-medium">
				<BackButton
					defaultHref="/account"
					variant="ghost"
					text={null}
					className="p-2"
				/>
				Edit Profile
			</h1>
			<Separator />
			<EditProfileForm {...user} />
		</div>
	)
}
