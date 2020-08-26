const res = module.exports = {};
res.active = {};
res.send = async (menu, channel, user) => {
	const message = await menu[""](channel, user);
	res.active[message.id] = menu;
	for (const emoji of Object.keys(menu)) {
		if (emoji == '') continue;
		await message.react(emoji);
	}
	return message;
};
res.pages = (...pages) => {
	const data = {};
	return {
		"": async (channel, user) => {
			data.page = 1;
			data.pages = pages;
			data.channel = channel;
			data.user = user;
			data.message = await channel.send(data.pages[data.page - 1]);
			data.repage = () => {
				data.message.edit(data.pages[data.page - 1]);
			};
			return data.message;
		},
		"\u23EA": user => {
			if (user != null && user.id != data.user.id) {
				return;
			}
			data.page = 1;
			data.repage();
		},
		"\u25C0": user => {
			if (user != null && user.id != data.user.id) {
				return;
			}
			data.page--;
			if (data.page < 1) {
				data.page = data.pages.length;
			}
			data.repage();
		},
		"\u25B6": user => {
			if (user != null && user.id != data.user.id) {
				return;
			}
			data.page++;
			if (data.page > data.pages.length) {
				data.page = 1;
			}
			data.repage();
		},
		"\u23E9": user => {
			if (user != null && user.id != data.user.id) {
				return;
			}
			data.page = data.pages.length;
			data.repage();
		}
	}
};