const res = module.exports = {};

res.ask = async (channel, user, question, time, {
	clearQuestion = false,
	clearAnswer = false,
	error = 'You did not reply within 30 seconds so the operation was cancelled.'
} = {}) => {
	const source = await channel.send(question);
	return new Promise((resolve, reject) => {
		channel.awaitMessages(msg => !user || msg.author.id == user.id, {
			max: 1,
			time: time
		}).then(async collected => {
			const message = collected.first();
			const text = message.content;
			if (clearQuestion) {
				await source.delete();
			}
			if (clearAnswer) {
				await message.delete();
			}
			resolve(text);
		}).catch(() => {
			channel.send(error);
			reject();
		});
	});
};
res.cleanAsk = (channel, user, question, time) => {
	return res.ask(channel, user, question, time, {
		clearQuestion: true, clearAnswer: true
	});
}