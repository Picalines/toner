import { RedirectType, redirect } from 'next/navigation'

export default function SignOutPage() {
	// TODO: might implement
	redirect('/account', RedirectType.replace)
}
