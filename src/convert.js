const res = module.exports = {};
res.regex = {
	user: /^<@!?([0-9]+)>$/,
	channel: /^<#([0-9]+)>$/,
	role: /^<@&([0-9]+)>$/,
	emoji: /^<a?:[^:]+:([0-9]+)>$/,
	id: /^([0-9]+)$/
};
res.permissions = [
	"CREATE_INSTANT_INVITE", "KICK_MEMBERS", "BAN_MEMBERS",
	"ADMINISTRATOR", "MANAGE_CHANNELS", "MANAGE_GUILD",
	"ADD_REACTIONS", "VIEW_AUDIT_LOG", "PRIORITY_SPEAKER",
	"STREAM", "VIEW_CHANNEL", "SEND_MESSAGES", "SEND_TTS_MESSAGES",
	"MANAGE_MESSAGES", "EMBED_LINKS", "ATTACH_FILES",
	"READ_MESSAGE_HISTORY", "MENTION_EVERYONE", "USE_EXTERNAL_EMOJIS",
	"VIEW_GUILD_INSIGHTS", "CONNECT", "SPEAK", "MUTE_MEMBERS",
	"DEAFEN_MEMBERS", "MOVE_MEMBERS", "USE_VAD", "CHANGE_NICKNAME",
	"MANAGE_NICKNAMES", "MANAGE_ROLES", "MANAGE_WEBHOOKS",
	"MANAGE_EMOJIS"
];
res.permission = perm => {
	return res.permissions.indexOf(perm.toUpperCase()) == -1 ? null : perm.toUpperCase();
};
res.unicodeEmoji = text => {
	const regex = emojiRegex();
	let match;
	const matches = [];
	while (match = regex.exec(text)) {
		matches.push(match[0]);
	}
	return matches.length == 1 && matches[0] == text ? matches[0] : null;
};
res.customEmoji = (text, guild) => {
	const matches = text.match(res.regex.emoji) || text.match(res.regex.id);
	return matches ? guild.emojis.cache.get(matches[1]) : null;
};
res.emoji = (text, guild) => {
	const ue = res.unicodeEmoji(text);
	return ue == null ? res.customEmoji(text, guild) : ue;
};
res.channel = (text, guild) => {
	const matches = text.match(res.regex.channel) || text.match(res.regex.id);
	return matches ? guild.channels.cache.get(matches[1]) : guild.channels.cache.get(text);
};
res.member = async (text, guild) => {
	const matches = text.match(res.regex.user) || text.match(res.regex.id);
	if (matches) {
		try {
			return await guild.members.fetch(matches[1]);
		} catch {}
	}
	return null;
};
res.role = async (text, guild) => {
	const matches = text.match(res.regex.role) || text.match(res.regex.id);
	if (matches) {
		try {
			return await guild.roles.fetch(matches[1]);
		} catch {}
	}
	return null;
};
res.user = async (text, bot) => {
	const matches = text.match(res.regex.user) || text.match(res.regex.id);
	if (matches) {
		try {
			return await bot.users.fetch(matches[1]);
		} catch {}
	}
	return null;
};