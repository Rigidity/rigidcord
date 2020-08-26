# RigidCord

## Example
```js
const Discord = require('discord.js');
const utils = require('rigidcord');
const config = require('./config.json');

const bot = new Discord.Client;

utils.setup.commands(bot);
utils.setup.menus(bot);

utils.perms.root = "332914508395839490";
utils.command.customPermissions = true;

utils.command.scope.add(new utils.command.Command({
	name: 'help',
	delay: 3000,
	run: async $ => {
		$.yes('Commands', "`!help` Displays this lovely message.");
	}
}));

bot.once('ready', async () => {
	await utils.setup.status(bot, 'watching', 'bot development');
	console.log(`${bot.user.tag} is now online and ready to be tested!`);
});

bot.login(config.token);
```

## Contributors
`Developer` Rigidity  
`Icon Author` https://www.flaticon.com/authors/pixel-perfect  

## Documentation
> Documentation coming soon. There's a lot to cover!