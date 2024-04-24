const relativeTimeCutoffsMs = [
	60,
	3600,
	86400,
	86400 * 7,
	86400 * 30,
	86400 * 365,
	Infinity,
]

const timeUnits: Intl.RelativeTimeFormatUnit[] = [
	'second',
	'minute',
	'hour',
	'day',
	'week',
	'month',
	'year',
]

type GetRelativeTimeOptions = Readonly<{
	originDate?: Date
	locales?: Intl.LocalesArgument
}>

function dateTimeMs(date: Date | number) {
	return typeof date == 'number' ? date : date.getTime()
}

export function getRelativeTimeString(
	date: Date | number,
	options?: GetRelativeTimeOptions,
): string {
	const currentTimeMs = dateTimeMs(date)
	const originTimeMs = dateTimeMs(options?.originDate ?? Date.now())

	const deltaSeconds = Math.round((currentTimeMs - originTimeMs) / 1000)

	const unitIndex = relativeTimeCutoffsMs.findIndex(
		cutoff => cutoff > Math.abs(deltaSeconds),
	)

	// Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
	// is one day in seconds, so we can divide our seconds by this to get the # of days
	const divisor = unitIndex ? relativeTimeCutoffsMs[unitIndex - 1] : 1

	const rtf = new Intl.RelativeTimeFormat(options?.locales, {
		numeric: 'auto',
	})
	return rtf.format(Math.floor(deltaSeconds / divisor), timeUnits[unitIndex])
}
