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
import { signOut } from '@/actions/auth/sign-out'
import ThemeToggle from './theme-toggle'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from './ui/alert-dialog'
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
				'h-full w-min max-w-[300px] border-r-2 p-2 gap-2 flex flex-col',
			)}
		>
			<Link
				href="/landing"
				className={cn(
					buttonVariants({ variant: 'ghost' }),
					'flex flex-row justify-center items-center gap-x-2',
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
		<SignOutTooltip>
			<Link href="/account" className={linkClassName}>
				<UserIcon />
				<span>Account</span>
			</Link>
		</SignOutTooltip>
	) : (
		<Link href="/sign-in" className={linkClassName}>
			<DoorOpenIcon />
			<span>Sign In</span>
		</Link>
	)
}

function SignOutTooltip({ children }: PropsWithChildren) {
	return (
		<AlertDialog>
			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent
					side="right"
					sideOffset={18}
					className="border-none p-0"
				>
					<AlertDialogTrigger asChild>
						<Button
							type="submit"
							variant="outline"
							className="p-2"
							aria-label="sign out"
						>
							<LogOutIcon />
						</Button>
					</AlertDialogTrigger>
				</TooltipContent>
			</Tooltip>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Sign out</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to sign out?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction asChild className="p-0">
						<form action={signOut}>
							<Button variant="destructive">Sign out</Button>
						</form>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
