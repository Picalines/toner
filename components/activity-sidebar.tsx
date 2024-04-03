import {
	DiscAlbum,
	DoorOpen,
	Heart,
	ListMusic,
	LogOut,
	PencilRuler,
	RadioTower,
	Search,
	User,
} from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { authenticate } from '@/lib/auth'
import { cn } from '@/lib/utils'
import ProjectLogo from '@/components/icons/projectLogo'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { signOut } from '@/actions/auth/sign-out'

const buttonConfig = {
	variant: 'ghost',
	size: 'sm',
} as const

const linkClassName = cn(
	buttonVariants(buttonConfig),
	'space-x-2 w-full justify-start',
	'cursor-pointer',
)

export default function ActivitySidebar() {
	return (
		<aside className="h-full w-[200px] border-r-2 p-2 space-y-2 flex flex-col">
			<Link
				href="/"
				className={cn(
					buttonVariants({ variant: 'ghost' }),
					'flex flex-row justify-center items-center gap-x-2',
				)}
			>
				<ProjectLogo width={24} height={24} />
				<span className="text-lg font-semibold">toner</span>
			</Link>
			<Separator />
			<section>
				<h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
					Listen
				</h2>
				<Link href="/browse" className={linkClassName}>
					<RadioTower />
					<span>Browse</span>
				</Link>
				<Link href="/subscriptions" className={linkClassName}>
					<Heart />
					<span>Subscriptions</span>
				</Link>
				<Link href="/library" className={linkClassName}>
					<ListMusic />
					<span>Library</span>
				</Link>
				<Link href="/search" className={linkClassName}>
					<Search />
					<span>Search</span>
				</Link>
			</section>
			<section>
				<h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
					Create
				</h2>
				<Link href="/projects" className={linkClassName}>
					<PencilRuler />
					<span>Projects</span>
				</Link>
				<Link href="/publications" className={linkClassName}>
					<DiscAlbum />
					<span>Publications</span>
				</Link>
			</section>
			<div className="flex-grow"></div>
			<Suspense>
				<AuthSidebarSection />
			</Suspense>
		</aside>
	)
}

async function AuthSidebarSection() {
	const signedIn = (await authenticate()) !== null

	if (signedIn) {
		return (
			<section>
				<Link href="/account" className={linkClassName}>
					<User />
					<span>Account</span>
				</Link>
				<form action={signOut}>
					<Button
						{...buttonConfig}
						type="submit"
						className={linkClassName}
					>
						<LogOut />
						<span>Sign Out</span>
					</Button>
				</form>
			</section>
		)
	}

	return (
		<section>
			<Link href="/sign-in" className={linkClassName}>
				<DoorOpen />
				<span>Sign In</span>
			</Link>
		</section>
	)
}
