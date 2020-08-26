const emojiRegex = require("emoji-regex");
const path = require("path");
const Discord = require("discord.js");
const ms = require('ms');
const fs = require('fs-extra');

module.exports = bot => {
	
	// Main Container
	const res = {};

	// Simple Files
	res.fs = {};

	// Discord Conversion
	res.convert = {};

	// Data Manipulation
	res.data = {};

	// Discord Embeds
	res.embed = {};

	// Command System
	res.commands = {};

	// Menu System
	res.menus = {};

	// Active Menus
	res.menus.active = {};

	// Permission System
	res.perms = {};

	// System Setup
	res.setup = {};

	// Default Permissions
	res.perms.base = {};

	// Root User
	res.perms.root = null;

	res.fs.exists = file => fs.existsSync(file);
	res.fs.read = file => fs.readFileSync(file, "utf-8");
	res.fs.write = (file, text) => fs.writeFileSync(file, text, "utf-8");
	res.fs.create = file => fs.ensureFileSync(file);
	res.fs.delete = file => fs.removeSync(file);
	res.fs.load = file => fs.readJsonSync(file);
	res.fs.save = (file, data) => fs.writeJsonSync(file, data);
	res.fs.move = (src, dest) => fs.moveSync(src, dest);
	res.fs.empty = dir => fs.emptyDirSync(dir);
	res.fs.copy = (src, dest) => fs.copySync(src, dest);
	res.fs.ensure = dir => fs.ensureDirSync(dir);
	res.fs.append = (file, text) => fs.writeFileSync(file, fs.readFileSync(file, "utf-8") + text, "utf-8");
	res.fs.edit = (file, handler) => {
		const data = fs.readJsonSync(file);
		const res = handler(data);
		fs.writeJsonSync(file, data);
		return res;
	};
	res.fs.list = dir => fs.readdirSync(dir);
	res.fs.base = file => path.basename(file);
	res.fs.dir = file => path.dirname(file);
	res.fs.path = (...items) => path.join(...items);
	res.fs.ext = file => path.extname(file);
	res.fs.name = file => path.basename(file, path.extname(file));
	res.fs.file = path => {
		try {
			const stat = fs.lstatSync(path);
			return stat.isDirectory();
		} catch {
			return false;
		}
	};
	res.fs.folder = path => {
		try {
			const stat = fs.lstatSync(path);
			return !stat.isDirectory();
		} catch {
			return false;
		}
	};

	// Page Splitting
	res.data.splitPages = (items, lines) => {
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
	}

	// Object Checker
	res.data.isObject = item => item && typeof item == 'object' && !Array.isArray(item);

	// Object Merger
	res.data.merge = (target, ...sources) => {
		if (!sources.length) return target;
		const source = sources.shift();
		if (res.data.isObject(target) && res.data.isObject(source)) {
		for (const key in source) {
			if (res.data.isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
					res.data.merge(target[key], source[key]);
				} else {
					Object.assign(target, { [key]: source[key] });
				}
			}
		}
		return res.data.merge(target, ...sources);
	};

	// Merge Concat
	res.data.mergeConcat = (target, ...sources) => {
		if (!sources.length) return target;
		const source = sources.shift();
		if (res.data.isObject(target) && res.data.isObject(source)) {
		for (const key in source) {
			if (res.data.isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
					res.data.mergeConcat(target[key], source[key]);
				} else if (Array.isArray(target) && Array.isArray(source)) {
				target.push(...source);
			} else {
					Object.assign(target, { [key]: source[key] });
				}
			}
		}
		return res.data.mergeConcat(target, ...sources);
	};

	// Send Menu
	res.menus.send = async (menu, channel, user) => {
		const message = await menu[""](channel, user);
		res.menus.active[message.id] = menu;
		for (const emoji of Object.keys(menu)) {
			if (emoji == '') continue;
			await message.react(emoji);
		}
		return message;
	};

	// Generate Pages
	res.menus.pages = (...pages) => {
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

	// Guild Directory
	res.data.guildFolder = './data/guilds';

	// User Directory
	res.data.userFolder = './data/users';

	// Guild Data
	res.data.guildData = {
		prefix: '!',
		permissions: {
			roles: {},
			users: {},
			builtins: {}
		}
	};

	// User Data
	res.data.userData = {
		prefix: '!'
	};

	// Data Setup
	res.setup.data = () => {
		const utils = {
			guild: (id, data) => {
				res.fs.ensure(res.data.guildFolder);
				const loc = res.fs.path(res.data.guildFolder, id + '.json');
				if (data === undefined) {
					if (!res.fs.exists(loc)) {
						res.fs.save(loc, res.data.guildData);
					}
					return res.data.merge(res.data.guildData, res.fs.load(loc));
				} else {
					res.fs.save(loc, data);
				}
			},
			user: (id, data) => {
				res.fs.ensure(res.data.userFolder);
				const loc = res.fs.path(res.data.userFolder, id + '.json');
				if (data === undefined) {
					if (!res.fs.exists(loc)) {
						res.fs.save(loc, res.data.userData);
					}
					return res.data.merge(res.data.userData, res.fs.load(loc));
				} else {
					res.fs.save(loc, data);
				}
			}
		};
		res.commands.fetchBuiltinPerms = (item, ctx) => ctx.guild ? utils.guild(ctx.guild).permissions.builtins[item] : undefined;
		res.commands.fetchRolePerms = (item, ctx) => ctx.guild ? utils.guild(ctx.guild).permissions.roles[item] : undefined;
		res.commands.fetchUserPerms = (item, ctx) => ctx.guild ? utils.guild(ctx.guild).permissions.users[item] : undefined;
		return utils;
	};

	// Command Setup
	res.setup.commands = () => {
		bot.on("message", async msg => {
			const scope = await res.commands.fetchScope(msg);
			const prefix = await res.commands.fetchPrefix(msg);
			const ping1 = `<@${bot.user.id}>`;
			const ping2 = `<@!${bot.user.id}>`;
			let text = msg.content;
			let match = false;
			if (text.startsWith(prefix)) {
				text = text.slice(prefix.length);
				match = text.trim() == text;
			} else if (text.startsWith(ping1)) {
				text = text.slice(ping1.length).trim();
				match = true;
			} else if (text.startsWith(ping2)) {
				text = text.slice(ping2.length).trim();
				match = true;
			}
			if (match) {
				let args = text.split(/ +/);
				if (args.length) {
					const name = args.shift();
					text = text.slice(name.length).trim();
					args = args.filter(item => item.length > 0);
					const command = scope.fetch(name);
					if (command != null) {
						const $ = {
							time: Date.now(),
							message: msg,
							channel: msg.channel,
							guild: msg.guild,
							member: msg.member,
							user: msg.author,
							mid: msg.id,
							cid: msg.channel.id,
							gid: msg.guild?.id,
							uid: msg.author.id,
							root: res.perms.root !== null && msg.author.id == res.perms.root,
							text, name, args,
							send: (...args) => msg.channel.send(...args),
							yes: (...args) => msg.channel.send(res.embed.yes(...args)),
							no: (...args) => msg.channel.send(res.embed.no(...args)),
							warn: (...args) => msg.channel.send(res.embed.warn(...args)),
							info: (...args) => msg.channel.send(res.embed.info(...args)),
							menu: (...args) => msg.channel.send(res.embed.menu(...args)),
							box: (...args) => msg.channel.send(res.embed.box(...args)),
							pages: (...args) => res.menus.send(res.menus.pages(...args), msg.channel, msg.author)
						};
						$.texts = [text];
						for (var i = 0; i < args.length; i++) {
							text = text.slice(args[i].length);
							$.texts.push(text);
						}
						$.permissionLists = [];
						if ($.member) {
							$.member.permissions.toArray().forEach(builtin => {
								if (res.perms.base[builtin] !== undefined) $.permissionLists.push(res.perms.base[builtin]);
							});
							$.member.permissions.toArray().forEach(builtin => {
								const item = res.commands.fetchBuiltinPerms(builtin, {
									guild: $.gid,
									channel: $.cid,
									user: $.uid
								});
								if (item) $.permissionLists.push(item);
							});
							$.member.roles.cache.forEach(role => {
								const item = res.commands.fetchRolePerms(role.id, {
									guild: $.gid,
									channel: $.cid,
									user: $.uid
								});
								if (item) $.permissionLists.push(item);
							});
							const item = res.commands.fetchUserPerms($.uid, {
								guild: $.gid,
								channel: $.cid,
								user: $.uid
							});
							if (item) $.permissionLists.push(item);
							if ($.guild.ownerID == $.uid || $.root) $.permissionLists.push(['+*']);
						} else {
							$.permissionLists.push(['+*']);
						}
						$.permissions = res.perms.combine(...$.permissionLists);
						$.has = perm => {
							if (res.commands.customPermissions) {
								return res.perms.multi($.permissions, perm);
							} else {
								return msg.member ? msg.member.hasPermission(perm) : true;
							}
						};
						$.needed = command.perms;
						$.present = [];
						$.missing = [];
						if ($.needed === null) {
							if ($.root) {
								$.present.push(null);
							} else {
								$.missing.push(null);
							}
						} else if (Array.isArray($.needed)) {
							$.needed.forEach(perm => {
								if ($.has(perm)) {
									$.present.push(perm);
								} else {
									$.missing.push(perm);
								}
							})
						} else {
							if ($.has($.needed)) {
								$.present.push($.needed);
							} else {
								$.missing.push($.needed);
							}
						}
						$.permit = $.root || !$.missing.length;
						if ($.needed === null && !$.root) {
							$.no('Restricted Access', 'You must be the bot developer to execute this command.');
						} else if (!$.permit) {
							$.no("Missing Permissions", `You are missing the following permissions: ${$.missing.map(item => "`" + item + "`").join(", ")}`);
						} else if (command.scope === true && !$.guild) {
							$.no('Scope Error', 'You may only execute this command on a server.');
						} else if (command.scope === false && $.guild) {
							$.no('Scope Error', 'You may not execute this command on a server.');
						} else {
							let allowed = true;
							if ($.uid in command.delays) {
								const passed = $.time - command.delays[$.uid];
								if (passed < command.delay && !$.root) {
									$.no('Command Cooldown', `You must wait another ${ms(command.delay - passed)} before executing this command.`);
									allowed = false;
								}
							}
							if (allowed) {
								command.delays[$.uid] = $.time;
								await command.run($);
							}
						}
					}
				}
			}
		});
	};
	
	// Menu Setup
	res.setup.menus = () => {
		bot.on("messageDelete", msg => {
			if (msg.id in res.menus.active) {
				delete res.menus.active[msg.id];
			}
		});
		bot.on("messageReactionAdd", async (reaction, user) => {
			let msg = reaction.message;
			if (reaction.message.partial) {
				try {
					msg = await reaction.message.fetch();
				} catch {
					return;
				}
			}
			if (msg == null) return;
			if (user.bot) return;
			if (msg.id in res.menus.active) {
				const menu = res.menus.active[msg.id];
				if (reaction.emoji.name in menu) {
					menu[reaction.emoji.name](user);
				}
				if (reaction.message.guild && reaction.message.guild.me.hasPermission("MANAGE_MESSAGES")) {
					await reaction.users.remove(user).catch(() => {});
				}
			}
		});
		bot.on("messageReactionRemove", async (reaction, user) => {
			let msg = reaction.message;
			if (reaction.message.partial) {
				try {
					msg = await reaction.message.fetch();
				} catch(e) {
					return;
				}
			}
			if (msg == null) return;
			if (user.bot || (reaction.message.guild && reaction.message.guild.me.hasPermission("MANAGE_MESSAGES"))) {
				return;
			}
			if (msg.id in res.menus.active) {
				const menu = res.menus.active[msg.id];
				if (reaction.emoji.name in menu) {
					menu[reaction.emoji.name](user);
				}
			}
		});
	};

	// Permission Format
	res.perms.validate = perm => {
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
	
	// Check Single
	res.perms.single = (has, need) => {
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

	// Check Multiple
	res.perms.multi = (has, need) => {
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
			if (res.perms.single(positive[i], need)) {
				positively++;
			}
		}
		let negatively = 0;
		for (var i = 0; i < negative.length; i++) {
			if (res.perms.single(negative[i], need)) {
				negatively++;
			}
		}
		return positively > 0 && negatively == 0;
	};
	res.perms.combine = (...lists) => {
		const res = [];
		lists.forEach(list => {
			list.forEach(perm => {
				const raw = perm.slice(1);
				const pos = "+" + raw;
				const neg = "-" + raw;
				if (res.indexOf(pos) != -1) {
					res.splice(res.indexOf(pos), 1);
				}
				if (res.indexOf(neg) != -1) {
					res.splice(res.indexOf(neg), 1);
				}
				res.push(perm);
			});
		});
		return res;
	};

	// Permission Mode
	res.commands.customPermissions = false;

	// Command Type
	res.commands.Command = class {
		constructor({
			name = [],
			aliases = [],
			info = 'No description provided.',
			type = 'Miscellaneous',
			usage = '',
			delay = 1000,
			perms = [],
			scope = true,
			run = async () => {}
		} = {}) {
			this.name = name;
			this.aliases = aliases;
			this.info = info;
			this.type = type;
			this.usage = usage;
			this.perms = perms;
			this.delay = delay;
			this.delays = {};
			this.scope = scope;
			this.run = run;
		}
	};

	// Command Scope
	res.commands.Scope = class {
		constructor(parent = null) {
			this.commands = [];
			this.parent = parent;
			this.children = [];
		}
		list() {
			const res = [];
			let current = this;
			while (current != null) {
				res.push(...current.commands);
				current = current.parent;
			}
			return res;
		}
		add(command) {
			if (this.commands.indexOf(command) != -1) return;
			this.commands.push(command);
		}
		remove(command) {
			if (this.commands.indexOf(command) == -1) return;
			this.commands.splice(this.commands.indexOf(command), 1);
		}
		fetch(name) {
			let res = null;
			const list = this.list();
			for (var i = list.length - 1; i >= 0; i--) {
				const command = list[i];
				if (command.name.toLowerCase() == name.toLowerCase() || command.aliases.map(item => item.toLowerCase()).indexOf(name.toLowerCase()) != -1) {
					res = command;
					break;
				}
			};
			return res;
		}
	};

	// Default Scope
	res.commands.scope = new res.commands.Scope;

	// Default Prefix
	res.commands.prefix = '!';

	// Scope Fetcher
	res.commands.fetchScope = async () => res.commands.scope;

	// Prefix Fetcher
	res.commands.fetchPrefix = async () => res.commands.prefix;

	// Role Permissions
	res.commands.fetchRolePerms = () => undefined;

	// Builtin Permissions
	res.commands.fetchBuiltinPerms = undefined;

	// User Permissions
	res.commands.fetchUserPerms = () => undefined;

	// Default Icons
	res.embed.icon = name => path.join(__dirname, 'icons', name + '.png');
	
	// Box Embed
	res.embed.box = (icon = res.embed.icon('info'), color = 0x999999, key = 'Untitled Embed', val = 'There is no content to be displayed here.', data = {}) => {
		return res.data.mergeConcat({
			embed: {
				author: {
					name: res.embed.truncate({
						text: key, size: 256
					}),
					icon_url: 'attachment://icon.png'
				},
				description: res.embed.truncate({
					text: val, size: 2048
				}),
				color, timestamp: Date.now()
			},
			files: [
				new Discord.MessageAttachment(icon, 'icon.png')
			]
		}, data);
	};

	// Yes Embed
	res.embed.yes = (key, val, data) => res.embed.box(res.embed.icon('yes'), 0x0099FF, key, val, data);

	// No Embed
	res.embed.no = (key, val, data) => res.embed.box(res.embed.icon('no'), 0xFF0000, key, val, data);

	// Info Embed
	res.embed.info = (key, val, data) => res.embed.box(res.embed.icon('info'), 0x999999, key, val, data);

	// Menu Embed
	res.embed.menu = (key, val, data) => res.embed.box(res.embed.icon('menu'), 0x999999, key, val, data);

	// Warn Embed
	res.embed.warn = (key, val, data) => res.embed.box(res.embed.icon('warn'), 0x00AA00, key, val, data);

	// Complex Truncation
	res.embed.truncate = ({
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
		let res = prefix + text + suffix;
		if (res.length > size && direction) {
			res = prefix + text.slice(0, size - overflow.length - prefix.length - suffix.length) + overflow + suffix;
		} else if (res.length > size) {
			res = prefix + overflow + text.slice(overflow.length + prefix.length + suffix.length, size) + suffix;
		}
		if (res.length > size && direction) {
			res = res.slice(0, size);
		} else if (res.length > size) {
			res = res.slice(res.length - size, res.length);
		}
		return res;
	};

	// Simple Status
	res.status = (type, name) => bot.user.setPresence({
		activity: {
			name, type: type.toUpperCase()
		},
		status: 'online'
	});

	// Conversion Regexes
	res.regex = {
		user: /^<@!?([0-9]+)>$/,
		channel: /^<#([0-9]+)>$/,
		role: /^<@&([0-9]+)>$/,
		emoji: /^<a?:[^:]+:([0-9]+)>$/,
		id: /^([0-9]+)$/
	};

	// Permission List
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

	// Permission Converter
	res.convert.permission = perm => {
		return res.permissions.indexOf(perm.toUpperCase()) == -1 ? null : perm.toUpperCase();
	};

	// Unicode Emoji Converter
	res.convert.unicodeEmoji = text => {
		const regex = emojiRegex();
		let match;
		const matches = [];
		while (match = regex.exec(text)) {
			matches.push(match[0]);
		}
		return matches.length == 1 && matches[0] == text ? matches[0] : null;
	};

	// Custom Emoji Converter
	res.convert.customEmoji = (text, guild) => {
		const matches = text.match(res.regex.emoji) || text.match(res.regex.id);
		return matches ? guild.emojis.cache.get(matches[1]) : null;
	};

	// Emoji Converter
	res.convert.emoji = (text, guild) => {
		const ue = res.convert.unicodeEmoji(text);
		return ue == null ? res.convert.customEmoji(text, guild) : ue;
	};

	// Channel Converter
	res.convert.channel = (text, guild) => {
		const matches = text.match(res.regex.channel) || text.match(res.regex.id);
		return matches ? guild.channels.cache.get(matches[1]) : guild.channels.cache.get(text);
	};

	// Member Converter
	res.convert.member = async (text, guild) => {
		const matches = text.match(res.regex.user) || text.match(res.regex.id);
		if (matches) {
			try {
				return await guild.members.fetch(matches[1]);
			} catch {}
		}
		return null;
	};

	// Role Converter
	res.convert.role = async (text, guild) => {
		const matches = text.match(res.regex.role) || text.match(res.regex.id);
		if (matches) {
			try {
				return await guild.roles.fetch(matches[1]);
			} catch {}
		}
		return null;
	};

	// User Converter
	res.convert.user = async text => {
		const matches = text.match(res.regex.user) || text.match(res.regex.id);
		if (matches) {
			try {
				return await bot.users.fetch(matches[1]);
			} catch {}
		}
		return null;
	}
	return res;
};