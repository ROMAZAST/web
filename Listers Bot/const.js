const { MongoClient, ObjectId } = require("mongodb");
const TelegramBot = require('node-telegram-bot-api');
const uri = "mongolink";
const client = new MongoClient(uri);
const config = require(`./config.json`);
const token = `${config.token}`;
const token2 = `${config.token2}`;
const bcrypt = require('bcryptjs');
const responce_answer = {
  "not_auth_pass": "<b>Ви ще не зареєстровані, зареєструйтесь командою:</b>\n<i>/pass Ваш_пароль</i>",
  "not_auth_login": "<b>Ви ще не авторизувались. Щоб увійти напишіть:</b>\n<i> /l Ваш_пароль</i>",
}
const emodji = {
  "list": `\uD83D\uDCDC`,
  "back": `\u21A9`,
  "settings": '\u2699\ufe0f',
  "my_lists": '\u{1F50E}',
  "add_new_list": `\u{1F4DD}`,
  "yes": `\u{2705}`,
  "no": `\u{274C}`,
  "reminder": `\u{231B}`,
  "help": `\u{1F64F}`,
  "delete": `\u{1F5D1}`,
  "edit_list": `\u{2712}`,
  "edit_product": `\u{1F58B}`,
  "share": `\u{1F48C}`,
  "money": `\u{1F4B5}`,
  "add_product": `\u{2795}`,
  "name": `\u{1F4CB}`,
  "plus_one": `\u2795\u0031\uFE0F\u20E3`,
  "plus_five": `\u2795\u0035\uFE0F\u20E3`,
  "minus_one": `\u2796\u0031\uFE0F\u20E3`,
  "minus_five": `\u2796\u0035\uFE0F\u20E3`,
  "next_page": `\u27A1`,
  "previous_page": `\u2B05`,
  "profile": `\u{1F464}`,
  "edit_name": `\u{270D}`,
  "share_lists": `\u{1F46A}`,
  "one": '\u0031\uFE0F\u20E3',
  "two": '\u0032\uFE0F\u20E3',
  "three":  '\u0033\uFE0F\u20E3',
  "four": '\u0034\uFE0F\u20E3'
}
const links = {
  "main_menu": `https://media.discordapp.net/attachments/791782853209358379/1112689263537049600/Frame12_1.png`,
  "profile": `https://media.discordapp.net/attachments/791782853209358379/1112690750874980392/prof.png`,
  "lists": `https://media.discordapp.net/attachments/791782853209358379/1112693973593637004/listt.png`,
  "settings": `https://media.discordapp.net/attachments/791782853209358379/1112694820390064158/set.png`,
  "help": `https://media.discordapp.net/attachments/791782853209358379/1112697917552201768/help.png`,
  "reminder": `https://media.discordapp.net/attachments/791782853209358379/1112698758166220820/reminder.png`,
  "my_lists": `https://media.discordapp.net/attachments/791782853209358379/1112699611556106250/my_list.png`,
  "edit_list": `https://media.discordapp.net/attachments/791782853209358379/1112741640755499008/edit.png`,
  "list": `https://media.discordapp.net/attachments/791782853209358379/1112733426521481266/list.png`,
  "change_sect": `https://media.discordapp.net/attachments/791782853209358379/1112742668611633253/change_sect.png`,
  "change_count": `https://media.discordapp.net/attachments/791782853209358379/1112744347008499832/change_count.png`,
  "change_prod": `https://media.discordapp.net/attachments/791782853209358379/1112743386458357829/change_prod.png`,
  "share_confirm": `https://media.discordapp.net/attachments/791782853209358379/1112819955772162139/share_confirm.png`,
  "shared_list": `https://media.discordapp.net/attachments/791782853209358379/1112823286313795714/shared_lists.png`,
  "auth": `https://media.discordapp.net/attachments/791782853209358379/1113443510859862088/auth.png`,
  "name_change": `https://media.discordapp.net/attachments/791782853209358379/1113450695450959872/name_change.png`,
  "pass": `https://cdn.discordapp.com/attachments/791782853209358379/1113475470239989760/pass.png`
}
const admins_id = ["527454973"]
// Створення об'єкту бота
const bot = new TelegramBot(token, { polling: true });
const bot_help = new TelegramBot(token2, { polling: true });
module.exports = {
    bot,
    bot_help,
    client,
    emodji,
    ObjectId,
    admins_id,
    bcrypt,
    links,
    responce_answer
  };