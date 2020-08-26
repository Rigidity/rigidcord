const util = require('util');

const res = module.exports = {};

res.objectString = data => {
	if (data === undefined || data === null) {
		return '' + data;
	} else if (typeof data == 'string') {
		return data;
	} else if (typeof data == 'symbol') {
		return data.description;
	} else if (typeof data == 'object' && !Array.isArray(data)) {
		return util.inspect(data);
	} else {
		return data.toString();
	}
};
res.isObject = item => item && typeof item == 'object' && !Array.isArray(item);
res.merge = (target, ...sources) => {
	if (!sources.length) return target;
	const source = sources.shift();
	if (res.isObject(target) && res.isObject(source)) {
	for (const key in source) {
		if (res.isObject(source[key])) {
			if (!target[key]) Object.assign(target, { [key]: {} });
				res.merge(target[key], source[key]);
			} else {
				Object.assign(target, { [key]: source[key] });
			}
		}
	}
	return res.merge(target, ...sources);
};
res.mergeConcat = (target, ...sources) => {
	if (!sources.length) return target;
	const source = sources.shift();
	if (res.isObject(target) && res.isObject(source)) {
	for (const key in source) {
		if (res.isObject(source[key])) {
			if (!target[key]) Object.assign(target, { [key]: {} });
				res.mergeConcat(target[key], source[key]);
			} else if (Array.isArray(target) && Array.isArray(source)) {
				target.push(...source);
			} else {
				Object.assign(target, { [key]: source[key] });
			}
		}
	}
	return res.mergeConcat(target, ...sources);
};
res.splitPages = (items, lines) => {
	const pages = [[]];
	for (var i = 0; i < items.length; i++) {
		pages[pages.length - 1].push(items[i]);
		if (pages[pages.length - 1].length >= lines) {
			pages.push([]);
		}
	}
	if (!pages[pages.length - 1].length) {
		pages.pop();
	}
	return pages;
};