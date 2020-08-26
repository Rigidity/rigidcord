const menuUtils = require('./menus');
const commandUtils = require('./command');
const permUtils = require('./perms');
const embedUtils = require('./embed');
const queryUtils = require('./query');

const res = module.exports = {};

res.status = (bot, type, name) => bot.user.setPresence({
	activity: {
		name, type: type.toUpperCase()
	},
	status: 'online'
});
res.menus = bot => {
	bot.on("messageDelete", msg => {
		if (msg.id in menuUtils.active) {
			delete menuUtils.active[msg.id];
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
		if (msg.id in menuUtils.active) {
			const menu = menuUtils.active[msg.id];
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
		if (msg.id in menuUtils.active) {
			const menu = menuUtils.active[msg.id];
			if (reaction.emoji.name in menu) {
				menu[reaction.emoji.name](user);
			}
		}
	});
};
res.commands = bot => {
	bot.on("message", async msg => {
		const scope = await commandUtils.fetchScope(msg);
		const prefix = await commandUtils.fetchPrefix(msg);
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
						root: permUtils.root !== null && msg.author.id == permUtils.root,
						text, name, args,
						send: (...args) => msg.channel.send(...args),
						yes: (...args) => msg.channel.send(embedUtils.yes(...args)),
						no: (...args) => msg.channel.send(embedUtils.no(...args)),
						warn: (...args) => msg.channel.send(embedUtils.warn(...args)),
						info: (...args) => msg.channel.send(embedUtils.info(...args)),
						menu: (...args) => msg.channel.send(embedUtils.menu(...args)),
						box: (...args) => msg.channel.send(embedUtils.box(...args)),
						pages: (...args) => menuUtils.send(menuUtils.pages(...args), msg.channel, msg.author),
						ask: (...args) => queryUtils.ask(msg.channel, msg.author, ...args),
						cleanAsk: (...args) => queryUtils.cleanAsk(msg.channel, msg.author, ...args)
					};
					$.texts = [text];
					for (var i = 0; i < args.length; i++) {
						text = text.slice(args[i].length).trim();
						$.texts.push(text);
					}
					$.permissionLists = [];
					if ($.member) {
						$.member.permissions.toArray().forEach(builtin => {
							if (permUtils.base[builtin] !== undefined) $.permissionLists.push(permUtils.base[builtin]);
						});
						$.member.permissions.toArray().forEach(builtin => {
							const item = commandUtils.fetchBuiltinPerms(builtin, {
								guild: $.gid,
								channel: $.cid,
								user: $.uid
							});
							if (item) $.permissionLists.push(item);
						});
						$.member.roles.cache.forEach(role => {
							const item = commandUtils.fetchRolePerms(role.id, {
								guild: $.gid,
								channel: $.cid,
								user: $.uid
							});
							if (item) $.permissionLists.push(item);
						});
						const item = commandUtils.fetchUserPerms($.uid, {
							guild: $.gid,
							channel: $.cid,
							user: $.uid
						});
						if (item) $.permissionLists.push(item);
						if ($.guild.ownerID == $.uid || $.root) $.permissionLists.push(['+*']);
					} else {
						$.permissionLists.push(['+*']);
					}
					$.permissions = permUtils.combine(...$.permissionLists);
					$.has = perm => {
						if (commandUtils.customPermissions) {
							return permUtils.multi($.permissions, perm);
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