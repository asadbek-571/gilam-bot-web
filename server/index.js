const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '6529487288:AAH76i4J5hC00fTtQ6uyu0JVPr2Y1-zghno';

// const token = '6392124644:AAGweSFNWmhx3pOXXRLlcFUTgb_tGpS2Sag';

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.setMyCommands([
	{ command: '/start', description: "Kurslar haqida ma'lumot" },
	{ command: '/courses', description: 'Barcha kurslar' },
]);

bot.on('message', async msg => {
	const chatId = msg.chat.id;
	const text = msg.text;

	if (text === '/start') {

		const keyboard = [
			[{ text: 'Xizmatlar' ,web_app:{url:'https://telegram-web-bot.vercel.app'}},{ text: 'Buyurtmalar' }],
			[{ text: 'Shaxsiy kabinet' },{ text: "Bog'lanish" }]
		];

		// Convert the keyboard array to JSON format
		const replyMarkup = {
			keyboard: keyboard,
			resize_keyboard: true,
			one_time_keyboard: true,
		};
		await bot.sendMessage(
			chatId,
			"Bo'limlarni tanlang",
			{
				reply_markup: replyMarkup
			}
		);
	}

	if (msg.web_app_data?.data) {
		try {
			const data = JSON.parse(msg.web_app_data?.data);

			await bot.sendMessage(
				chatId,
				"Sizning so'rovinggiz"
			);

			// for (item of data) {
			// 	await bot.sendPhoto(chatId, item.Image);
			// 	await bot.sendMessage(
			// 		chatId,
			// 		`${item.title} - ${item.quantity}x`
			// 	);
			// }

			await bot.sendMessage(
				chatId,
				`Umumiy narx - ${data
					.reduce((a, c) => a + c.price * c.quantity, 0)
					.toLocaleString('en-US', {
						style: 'currency',
						currency: 'USD',
					})}`
			);
		} catch (error) {
			console.log(error);
		}
	}
});

app.post('/web-data', async (req, res) => {
	const { queryID, products } = req.body;

	try {
		await bot.answerWebAppQuery(queryID, {
			type: 'article',
			id: queryID,
			title: 'Muvaffaqiyatli xarid qildingiz',
			input_message_content: {
				message_text: `Xaridingiz bilan tabriklayman, siz ${products
					.reduce((a, c) => a + c.price * c.quantity, 0)
					.toLocaleString('en-US', {
						style: 'currency',
						currency: 'USD',
					})} qiymatga ega mahsulot sotib oldingiz, ${products
					.map(c => `${c.title} ${c.quantity}X`)
					.join(', ')}`,
			},
		});
		return res.status(200).json({});
	} catch (error) {
		return res.status(500).json({});
	}
});

app.listen(process.env.PORT || 8000, () =>
	console.log('Server started')
);
