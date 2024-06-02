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
import {
	type ComponentProps,
	type ComponentType,
	type PropsWithChildren,
	Suspense,
} from 'react'
import { authenticate } from '@/lib/auth'
import { cn } from '@/lib/utils'
import ProjectLogo from '@/components/icons/project-logo'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import ThemeToggle from './theme-toggle'
import {
	Tooltip,
	TooltipArrow,
	TooltipContent,
	TooltipTrigger,
} from './ui/tooltip'

export default function ActivitySidebar({
	className,
	...asideProps
}: ComponentProps<'aside'>) {
	return (
		<aside
			{...asideProps}
			className={cn(
				'flex h-full w-min max-w-[300px] flex-col gap-2 border-r p-2',
				className,
			)}
		>
			<SidebarLink href="/landing" Icon={ProjectLogo} />
			<Separator />
			<SidebarLink href="/browse" Icon={RadioTowerIcon}>
				Browse
			</SidebarLink>
			<SidebarLink href="/subscriptions" Icon={HeartIcon}>
				Subscriptions
			</SidebarLink>
			<SidebarLink href="/library" Icon={ListMusicIcon}>
				Library
			</SidebarLink>
			<SidebarLink href="/search" Icon={SearchIcon}>
				Search
			</SidebarLink>
			<div className="flex-grow" />
			<Suspense>
				<AccountSidebarLink />
			</Suspense>
			<ThemeToggle variant="ghost" themeName={false} />
		</aside>
	)
}

function SidebarLink({
	href,
	Icon,
	className,
	children,
}: PropsWithChildren & {
	href: string
	Icon: ComponentType<ComponentProps<'svg'>>
	className?: string
}) {
	return (
		<Tooltip delayDuration={0}>
			<TooltipTrigger asChild>
				<Link
					href={href}
					className={buttonVariants({ variant: 'ghost' })}
				>
					<Icon width={24} height={24} />
				</Link>
			</TooltipTrigger>
			{children ? (
				<TooltipContent
					side="right"
					sideOffset={0}
					className={className}
				>
					<TooltipArrow />
					{children}
				</TooltipContent>
			) : null}
		</Tooltip>
	)
}

async function AccountSidebarLink() {
	const signedIn = (await authenticate()) !== null

	return signedIn ? (
		<SidebarLink
			href="/account"
			Icon={UserIcon}
			className="flex flex-row items-center gap-2 pr-1"
		>
			<span>Account</span>
			<Link
				href="/sign-out"
				scroll={false}
				className={cn(
					buttonVariants({
						variant: 'ghost',
					}),
					'h-min p-1',
				)}
			>
				<LogOutIcon />
			</Link>
		</SidebarLink>
	) : (
		<SidebarLink href="/sign-in" Icon={DoorOpenIcon}>
			Sign In
		</SidebarLink>
	)
}
