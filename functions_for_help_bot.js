
const {admins_id, ObjectId,emodji, client, bot_help, bot} = require("./const.js")
// getting the number of documents in the collection
async function getCountOfDocuments() {
  try {
    const db = client.db('test');
    const collection = db.collection('ticket');
    const count = await collection.countDocuments({});
    return count;
  } catch (error) { console.error('Помилка:', error); }
}
// adding a document to the collection
async function addTicket(data) {
  try {
    const db = client.db('test');
    const collection = db.collection('ticket');
    const result = await collection.insertOne(data);
  } catch (error) { console.error('Помилка:', error); }
}
// adding a question to the collection
function add_question_to_db(msg,match) {
  const chatId = msg.chat.id
  const res = match[1]
  if(res[0] == ' '){
    if(res.length >= 150) { bot_help.sendMessage(chatId, `Максимальна кількість символів питання або пропозиції - 150.`) }
    else if(res.length >= 20) {
      const text = match[1]
      getCountOfDocuments().then(count =>{
        count += 1
        data = {
          question: text,
          id: msg.chat.id,
          number: count,
          answer: `waiting`
        }
        addTicket(data).then( bot_help.sendMessage(msg.chat.id, `Ваш запит добавлено, номер: ${count}`))
      })
    }
    else { bot_help.sendMessage(chatId, `Мінімальна кількість символів питання або пропозиції - 20.`); }
  }
  else { bot_help.sendMessage(chatId, `Ви неправильно ввели команду. Приклад:\n /ask Вашe_питання`); }
} 
// opening a list of questions
function open_tickets(callbackQuery, page) {
  const message = callbackQuery.message;
  findTicketsByIdAndAnswer(callbackQuery.from.id).then(tickets => {
    const keyboard = generateQuestionButtons(tickets,page)
    var mesg = `Ваші запити:`
    bot_help.editMessageText(mesg, { chat_id: message.chat.id, message_id: message.message_id, reply_markup: keyboard });
  })
}
// main menu
function main_menu(msg) {
  const targetBotLink = 'https://t.me/listers_bot';
  var mesg = '>Щоб задати питання напишіть -> /ask ваше_питання.' +
    ' Наприклад: \n<b>/ask Привіт, хто є адміністратором цих ботів?</b>\n' +
    '>Щоб перевірити відповідь на ваше питання або пропозицію - натисніть "Запитання і пропозиції".';
  const keyboard = {
    inline_keyboard: [
      [{ text: '\uD83D\uDCDC Запитання і пропозиції', callback_data: 'tickets' }],
      [{ text: `${emodji.back} Повернутись до основного бота`, url: `${targetBotLink}` }]
    ],
  };
  bot_help.sendMessage(msg.chat.id, mesg, { reply_markup: keyboard, parse_mode: "HTML" });
}
// opening the main menu
function open_menu(callbackQuery) {
  const message = callbackQuery.message
  const targetBotLink = 'https://t.me/listers_bot';
  var mesg = '>Щоб задати питання напишіть: /ask ваше_питання.\n\n' +
    ' Наприклад: \n<b>/ask Привіт, хто є адміністратором цих ботів?</b>\n\n' +
    '>Щоб перевірити відповідь на ваше питання або пропозицію - натисніть "Запитання і пропозиції".';
  const keyboard = {
    inline_keyboard: [
      [{ text: '\uD83D\uDCDC Запитання і пропозиції', callback_data: 'tickets' }],
      [{ text: `${emodji.back} Повернутись до основного бота`, url: `${targetBotLink}` }]
    ],
  };
  if (message.text !== mesg ) {
    bot_help.editMessageText(mesg, { chat_id: message.chat.id, message_id: message.message_id, reply_markup: keyboard,  parse_mode: "HTML" });
  }
  bot_help.answerCallbackQuery(callbackQuery.id, );
}
// finding a document by id 
async function findTicketsByIdAndAnswer(_id) {
  try {
    const db = client.db('test');
    const collection = db.collection('ticket');
    const query = { id: _id, answer: { $ne: 'deleted' } };
    const tickets = await collection.find(query).toArray();
    return tickets;
  } catch (error) { console.error('Помилка:', error); }

}
// finding a document by id for the answer
async function findTicketsByIdforAnswer() {
  try {
    const db = client.db('test');
    const collection = db.collection('ticket');
    const query = { answer: `waiting` } ;
    const tickets = await collection.find(query).toArray();
    return tickets;
  } catch (error) { console.error('Помилка:', error); }
}
// opening a list of questions for the answer
function open_ask(msg){
  findTicketsByIdforAnswer().then(tickets =>{
    var mesg = ``;
    tickets.slice(0, 10).forEach(obj => { mesg = `${mesg}|| №${obj.number} || -> ${obj.question}\n  \n`; });
    if(mesg == ``){ bot_help.sendMessage(msg.chat.id, `Поки питань немає)`); }
    else if(mesg !== ``){ bot_help.sendMessage(msg.chat.id, mesg) }
  })
}
// generating buttons for questions
function generateQuestionButtons(questions, currentPage) {
  const pageSize = 10;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageQuestions = questions.slice(startIndex, endIndex);
  const buttons = [];
  let row = [];

  pageQuestions.forEach((question, index) => {
    const buttonText = `Питання №${question.number}`;
    const callbackData = `open_question:${question._id}`;
    const button = { text: buttonText, callback_data: callbackData };
    row.push(button);
    if ((index + 1) % 2 === 0) { buttons.push(row); row = []; }
  });

  if (currentPage > 1) {
    const previousPageButton = { text: `${emodji.previous_page} Назад`, callback_data: `previous_page:${parseInt(currentPage)-1}` };
    row.push(previousPageButton);
  }
  if (endIndex < questions.length) {
    const nextPageButton = { text: `${emodji.next_page} Вперед`, callback_data: `next_page:${parseInt(currentPage)+1}` };
    row.push(nextPageButton);
  }
  buttons.push(row);
  buttons.push([{ text: `${emodji.back} Повернутись назад`, callback_data: 'menu' }]);
  const keyboard = { inline_keyboard: buttons };
  return keyboard;
}
// finding a document by id
async function getDocumentById(documentId) {
  try {
    const database = client.db('test'); 
    const collection = database.collection(`ticket`);
    const query = { _id: new ObjectId(documentId) };
    const document = await collection.findOne(query);
    return document;
  } finally {}
}
// opening a document
function openDocument(callbackQuery,doc) {
  const message = callbackQuery.message;
  var mesg = `Номер: ${doc.number}\n`
  + `> Запитання: \n${doc.question}\n> Відповідь:\n`;
  if(doc.answer == `waiting`){ mesg = mesg + `Нажаль, відповіді ще немає, але скоро ми Вам відповімо!` }
  else { mesg = mesg + `${doc.answer}` }
  const keyboard = {
    inline_keyboard: [
      [{ text: `${emodji.back} Повернутись назад`, callback_data: 'tickets' }],
      [{ text: `${emodji.delete} Видалити`, callback_data: `delete_ticket:${doc.number}` }]
    ],
  };
  bot_help.editMessageText(mesg, { chat_id: message.chat.id, message_id: message.message_id, reply_markup: keyboard });
}
// setting the answer to deleted
async function setAnswerDelete(id_user) {
  try {
    const database = client.db("test");
    const accounts = database.collection("ticket");;
    const filter = { _id:new ObjectId(id_user)};
    const updateDoc = { $set: { answer: `deleted` } };
    const result = await accounts.updateOne(filter, updateDoc);
  } finally {}
}
// setting the answer deleted by number
async function setAnswerDeleteByNumber(_number) {
  try {
    const database = client.db("test");
    const accounts = database.collection("ticket");;
    const filter = { number: parseInt(_number)};
    const updateDoc = { $set: { answer: `deleted` } };
    const result = await accounts.updateOne(filter, updateDoc);
    return _number
  } finally {}
}
// setting the answer to waiting by number
async function setAnswerRestorByNumber(_number) {
  try {
    const database = client.db("test");
    const accounts = database.collection("ticket");;
    const filter = { number: parseInt(_number)};
    const updateDoc = { $set : { answer: `waiting` } };
    const result = await accounts.updateOne(filter, updateDoc);
    return _number
  } finally {}
}
// settinf the answer deleted
async function setAnswerDelete(id_user) {
  try {
    const database = client.db("test");
    const accounts = database.collection("ticket");;
    const filter = { _id:new ObjectId(id_user)};
    const options = { upsert: true };
    const updateDoc = { $set: { answer: `deleted` } };
    const result = await accounts.updateOne(filter, updateDoc, options);
  } finally {}
}
// updating the answer by number
async function updateAnswerByNumber(_number, _answer) {
  try {
    const db = client.db('test');
    const collection = db.collection('ticket');
    const query = { number: parseInt(_number) };
    const update = { $set: { answer: _answer } };
    const result = await collection.updateOne(query, update);
    return result.modifiedCount;
  } catch (error) { console.error('Помилка:', error); }
}
module.exports = {updateAnswerByNumber,
  setAnswerRestorByNumber, setAnswerDeleteByNumber, open_ask, open_menu, setAnswerDelete,openDocument,
  open_tickets, getDocumentById, getCountOfDocuments, generateQuestionButtons, 
  addTicket, add_question_to_db, main_menu, findTicketsByIdAndAnswer
};