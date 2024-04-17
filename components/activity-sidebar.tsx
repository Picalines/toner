import {
	DoorOpenIcon,
	HeartIcon,
	ListMusicIcon,
	LogOutIcon,
	RadioTowerIcon,
	SearchIcon,
	UserIcon,
} from 'lucide-react'
import Link from 'next/link'
import { ComponentProps, PropsWithChildren, Suspense } from 'react'
import { authenticate } from '@/lib/auth'
import { cn } from '@/lib/utils'
import ProjectLogo from '@/components/icons/project-logo'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import SignOutDialog, { SignOutDialogTrigger } from './sign-out-dialog'
import ThemeToggle from './theme-toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

const buttonConfig = {
	variant: 'ghost',
	size: 'sm',
} as const

const linkClassName = cn(
	buttonVariants(buttonConfig),
	'space-x-2 w-full justify-start',
	'cursor-pointer',
)

export default function ActivitySidebar({
	className,
	...asideProps
}: ComponentProps<'aside'>) {
	return (
		<aside
			{...asideProps}
			className={cn(
				className,
				'flex h-full w-min max-w-[300px] flex-col gap-2 border-r-2 p-2',
			)}
		>
			<Link
				href="/landing"
				className={cn(
					buttonVariants({ variant: 'ghost' }),
					'flex flex-row items-center justify-center gap-x-2',
				)}
			>
				<ProjectLogo width={24} height={24} />
				<span className="text-lg font-semibold">toner</span>
			</Link>
			<Separator />
			<Link href="/browse" className={linkClassName}>
				<RadioTowerIcon />
				<span>Browse</span>
			</Link>
			<Link href="/subscriptions" className={linkClassName}>
				<HeartIcon />
				<span>Subscriptions</span>
			</Link>
			<Link href="/library" className={linkClassName}>
				<ListMusicIcon />
				<span>Library</span>
			</Link>
			<Link href="/search" className={linkClassName}>
				<SearchIcon />
				<span>Search</span>
			</Link>
			<div className="flex-grow"></div>
			<Suspense>
				<AuthSidebarSection />
			</Suspense>
			<ThemeToggle {...buttonConfig} className={linkClassName} />
		</aside>
	)
}

async function AuthSidebarSection() {
	const signedIn = (await authenticate()) !== null

	return signedIn ? (
		<SignOutDialog>
			<SignOutTooltip>
				<Link href="/account" className={linkClassName}>
					<UserIcon />
					<span>Account</span>
				</Link>
			</SignOutTooltip>
		</SignOutDialog>
	) : (
		<Link href="/sign-in" className={linkClassName}>
			<DoorOpenIcon />
			<span>Sign In</span>
		</Link>
	)
}
function SignOutTooltip({ children }: PropsWithChildren) {
	return (
		<Tooltip delayDuration={0}>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent
				side="right"
				sideOffset={18}
				className="border-none p-0"
			>
				<SignOutDialogTrigger asChild>
					<Button
						type="submit"
						variant="outline"
						className="p-2"
						aria-label="sign out"
					>
						<LogOutIcon />
					</Button>
				</SignOutDialogTrigger>
			</TooltipContent>
		</Tooltip>
	)
}
