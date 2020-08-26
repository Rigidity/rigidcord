const Discord = require('discord.js');
const path = require('path');
const dataUtils = require('./data');

const res = module.exports = {};

res.icon = name => path.join(__dirname, 'icons', name + '.png');
res.box = (icon = res.icon('info'), color = 0x999999, key = 'Untitled Embed', val = 'There is no content to be displayed here.', data = {}) => {
	return dataUtils.mergeConcat({
		embed: {
			author: {
				name: res.truncate({
					text: key, size: 256
				}),
				icon_url: 'attachment://icon.png'
			},
			description: res.truncate({
				text: val, size: 2048
			}),
			color, timestamp: Date.now()
		},
		files: [
			new Discord.MessageAttachment(icon, 'icon.png')
		]
	}, data);
};
res.yes = (key, val, data) => res.box(res.icon('yes'), 0x0099FF, key, val, data);
res.no = (key, val, data) => res.box(res.icon('no'), 0xFF0000, key, val, data);
res.info = (key, val, data) => res.box(res.icon('info'), 0x999999, key, val, data);
res.menu = (key, val, data) => res.box(res.icon('menu'), 0x999999, key, val, data);
res.warn = (key, val, data) => res.box(res.icon('warn'), 0x00AA00, key, val, data);
res.truncate = ({
	text = "",
	size = 2048,
	prefix = "",
	suffix = "",
	overflow = "...",
	direction = true
} = {}) => {
	if (typeof text != "string") {
		return text;
	}
	let result = prefix + text + suffix;
	if (result.length > size && direction) {
		result = prefix + text.slice(0, size - overflow.length - prefix.length - suffix.length) + overflow + suffix;
	} else if (result.length > size) {
		result = prefix + overflow + text.slice(overflow.length + prefix.length + suffix.length, size) + suffix;
	}
	if (result.length > size && direction) {
		result = result.slice(0, size);
	} else if (result.length > size) {
		result = result.slice(result.length - size, result.length);
	}
	return result;
};