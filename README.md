# RigidCord

## Example
```js
const Discord = require('discord.js');
const Utils = require('rigidcord');
const config = require('./config.json');

const bot = new Discord.Client;
utils = Utils(bot);

utils.setup.commands();
utils.setup.menus();

utils.perms.root = "332914508395839490";
utils.commands.customPermissions = true;

utils.commands.scope.add(new utils.commands.Command({
	name: 'help',
	delay: 3000,
	run: async $ => {
		$.yes('Commands', "`!help` Displays this lovely message.");
	}
}));

bot.once('ready', async () => {
	await utils.status('watching', 'bot development');
	console.log(`${bot.user.tag} is now online and ready to be tested!`);
});

bot.login(config.token);
```

## Contributors
`Developer` Rigidity  
`Icon Author` https://www.flaticon.com/authors/pixel-perfect  

## Documentation
> An asterisks in front of a function denotes it as being asynchronous or returning a promise.

### rigidcord
> General utilities that aren't scoped.

`permissions` A list of Discord permission names.  
`regex` Conversion regexes for Discord objects.  
`status(type, text)` Modifies the Client status in a simple way.  

### rigidcord.convert
> Converts text into Discord objects.

`permission(text)` Converts text into a permission name or null.  
`unicodeEmoji(text)` Converts text into a unicode emoji or null.  
`customEmoji(text, guild)` Converts text into a custom emoji or null.  
`emoji(text, guild)` Converts text into an emoji or null.  
`channel(text, guild)` Converts text into a guild channel or null.  
`*member(text, guild)` Converts text into a guild member or null.  
`*role(text, guild)` Converts text into a role or null.  
`*user(text)` Converts text into a user or null.  

### rigidcord.data
> Data manipulation utilities.

`isObject(item)` Checks whether something is an object and not an array.  
`merge(target, ...sources)` Merges source objects with a target object.  
`mergeConcat(target, ...sources)` Merges source objects with a target object, concatenating arrays.  

### rigidcord.embed
> Embed simplification utilities.

`truncate({text, size, prefix, suffix, overflow, direction})` Truncates text with given options.  
`icon(name)` Fetches a built in RigidCord icon path.  
`box(icon, color, key, val, data)` Generates a simple box embed.  
`yes(key, val)` Generates a blue box with a checkmark.  
`no(key, val)` Generates a red box with an error icon.  
`info(key, val)` Generates a gray box with a question mark.  
`menu(key, val)` Generates a gray box with a menu icon.  
`warn(key, val)` Generates a green box with an exclamation point.  

### rigidcord.commands
> Command management utilities.

`new Scope(parent)` Instantiates a new scope.  
`new Command({name, aliases, info, type, usage, delay, perms, scope, run})` Makes a command.  
`customPermissions` Flag for whether or not custom permission nodes should be used for commands.  
`scope` Default command scope.  
`prefix` Default command prefix.  
`fetchScope(message)` Overwritable scope fetcher for commands.  
`fetchPrefix(message)` Overwritable prefix fetcher for commands.  

### rigidcord.menus
> Menu definition utilities.

`active` The active message menu list.  
`*send(menu, channel, user)` Sends a menu to a channel with an optional author.  
`pages(...contents)` Generates a paged menu with the given pages.  

### rigidcord.perms
> Permission system utilities.

`root` Defines the root or developer user id for the bot.  
`base` Map of default permission nodes assigned to Discord permissions.  
`validate(node)` Checks whether a permission node is of a valid format.  
`single(has, need)` Checks whether the needed permission matches.  
`multi(has, need)` Checks whether a list contains the needed permission.  
`combine(...lists)` Combines a set of permission node lists into a single list.  

### rigidcord.setup
> Event and system setup utilities.

`menus()` Sets up the menu system with the needed events.  
`commands()` Sets up the command system with the needed events.  