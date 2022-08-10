export default (value) => {
	const specialChars = "&~\"#'{([-|`_\\^@])°+=}$£ø^¨~*µ%!§:/;.,?".split("")
	if (value.length < 10 || value.length > 50) return false
	let nbSpecialChars = 0,
		nbNumbers = 0,
		nbMajs = 0
	for (
		let i = 0;
		i < value.length && (nbSpecialChars < 1 || nbNumbers < 1 || nbMajs < 1);
		i++
	) {
		if (specialChars.includes(value[i])) nbSpecialChars++
		if (parseInt(value[i]).toString() === value[i]) nbNumbers++
		if (value[i].toLowerCase() !== value[i]) nbMajs++
	}
	return nbMajs >= 1 && nbNumbers >= 1 && nbSpecialChars >= 1
}
