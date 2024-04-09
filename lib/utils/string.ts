export const capitalize = (str: string) =>
	str.length == 0 ? str : str[0].toUpperCase() + str.slice(1)
