import type { PropsWithChildren, ReactNode } from 'react'

type Props = Readonly<PropsWithChildren & { modal: ReactNode }>

export default function LandingLayout({ children, modal }: Props) {
	return (
		<>
			{children}
			{modal}
		</>
	)
}
