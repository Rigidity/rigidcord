const res = module.exports = {};
res.base = {};
res.root = null;
res.validate = perm => {
	if (!perm.length || perm.length > 64) return false;
	if (["+", "-"].indexOf(perm.charAt(0)) == -1) return false;
	const raw = perm.slice(1);
	if (raw.replace(/[^a-zA-Z0-9$.*]/g, "") != raw) return false;
	const items = raw.split(".");
	for (var i = 0; i < items.length; i++) {
		if (!items[i].length) return false;
		if (items[i].indexOf("*") != -1 && items[i] != "*") return false;
		if (items[i] == "*" && i != items.length - 1) return false;
	}
	return true;
};
res.single = (has, need) => {
	const hasItems = has.split(".");
	const needItems = need.split(".");
	for (var i = 0; i < hasItems.length; i++) {
		if (hasItems[i] == "*") {
			return true;
		} else if (hasItems[i].toLowerCase() != needItems[i].toLowerCase()) {
			return false;
		}
	}
	return true;
};
res.multi = (has, need) => {
	const positive = [];
	const negative = [];
	has.forEach(item => {
		if (item.startsWith("-")) {
			negative.push(item.slice(1));
		} else if (item.startsWith("+")) {
			positive.push(item.slice(1));
		}
	});
	let positively = 0;
	for (var i = 0; i < positive.length; i++) {
		if (res.single(positive[i], need)) {
			positively++;
		}
	}
	let negatively = 0;
	for (var i = 0; i < negative.length; i++) {
		if (res.single(negative[i], need)) {
			negatively++;
		}
	}
	return positively > 0 && negatively == 0;
};
res.combine = (...lists) => {
	const result = [];
	lists.forEach(list => {
		list.forEach(perm => {
			const raw = perm.slice(1);
			const pos = "+" + raw;
			const neg = "-" + raw;
			if (result.indexOf(pos) != -1) {
				result.splice(result.indexOf(pos), 1);
			}
			if (result.indexOf(neg) != -1) {
				result.splice(result.indexOf(neg), 1);
			}
			result.push(perm);
		});
	});
	return result;
};