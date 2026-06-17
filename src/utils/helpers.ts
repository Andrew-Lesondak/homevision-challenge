export const formatDollars = (value: number, decimals = 2) => {
	let dollars = value;
	if (dollars === null || dollars === undefined) dollars = 0;
	const num = Number(dollars);
	const prefix = num < 0 ? '-$' : '$';
	return `${prefix}${Math.abs(num).toLocaleString(undefined, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	})}`;
};