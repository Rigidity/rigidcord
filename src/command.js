const res = module.exports = {};
res.customPermissions = false;
res.Command = class {
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
res.Scope = class {
	constructor(parent = null) {
		this.commands = [];
		this.parent = parent;
		this.children = [];
	}
	list() {
		const result = [];
		let current = this;
		while (current != null) {
			result.push(...current.commands);
			current = current.parent;
		}
		return result;
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
res.scope = new res.Scope;
res.prefix = '!';
res.fetchScope = async () => res.scope;
res.fetchPrefix = async () => res.prefix;
res.fetchRolePerms = () => undefined;
res.fetchBuiltinPerms = undefined;
res.fetchUserPerms = () => undefined;