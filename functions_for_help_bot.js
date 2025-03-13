
const {admins_id, ObjectId,emodji, client, bot_help, bot} = require("./const.js")

async function getCountOfDocuments() {
  try {
    const db = client.db('test');
    const collection = db.collection('ticket');
    const count = await collection.countDocuments({});
    console.log('Кількість документів:', count);
    return count;
    } catch (error) {
      console.error('Помилка:', error);
    }
}
async function addTicket(data) {
    
  
    try {
      const db = client.db('test');
      const collection = db.collection('ticket');
      const result = await collection.insertOne(data);
      console.log('Документ успішно доданий:', result.insertedId);
    } catch (error) {
      console.error('Помилка:', error);
    }
  }
function add_question_to_db(msg,match)
{
    const chatId = msg.chat.id
    const res = match[1]
    console.log(`Кількість символів: ${res.length}`)
    console.log(match[1])
    if(res[0] == ' '){
        console.log()
        if(res.length >= 150)
        {
          bot_help.sendMessage(chatId, `Максимальна кількість символів питання або пропозиції - 150.`);
        }
        else if(res.length >= 20)
        {
            const text = match[1]
            getCountOfDocuments().then(count =>{
                console.log(count)
                count += 1
                data = {
                    question: text,
                    id: msg.chat.id,
                    number: count,
                    answer: `waiting`
                    
                }
                addTicket(data).then( 
                   bot_help.sendMessage(msg.chat.id, `Ваш запит добавлено, номер: ${count}`)
                   )
            })
            console.log(res.length)
        }
        else{
            bot_help.sendMessage(chatId, `Мінімальна кількість символів питання або пропозиції - 20.`); 
        }
    }
    else {
       bot_help.sendMessage(chatId, `Ви неправильно ввели команду. Приклад:\n /ask Вашe_питання`); 
    }
} 
function open_tickets(callbackQuery, page)
{
    const message = callbackQuery.message;
    findTicketsByIdAndAnswer(callbackQuery.from.id).then(tickets => {
        const keyboard = generateQuestionButtons(tickets,page)
        var mesg = `Ваші запити:`
        bot_help.editMessageText(mesg, { chat_id: message.chat.id, message_id: message.message_id, reply_markup: keyboard });
    })
}
function main_menu(msg)
{
    const targetBotLink = 'https://t.me/listers_bot';
    var mesg = '>Щоб задати питання напишіть -> /ask ваше_питання.' +
      ' Наприклад: \n<b>/ask Привіт, хто є адміністратором цих ботів?</b>\n' +
      '>Щоб перевірити відповідь на ваше питання або пропозицію - натисніть "Запитання і пропозиції".';
    const keyboard = {
      inline_keyboard: [
        [
          { text: '\uD83D\uDCDC Запитання і пропозиції', callback_data: 'tickets' }
        ],
        [
          { text: `${emodji.back} Повернутись до основного бота`, url: `${targetBotLink}` }
        ]
      ],
    };
    // Відправлення повідомлення з клавіатурою
    bot_help.sendMessage(msg.chat.id, mesg, { reply_markup: keyboard, parse_mode: "HTML" });
}
function open_menu(callbackQuery)
{
    const message = callbackQuery.message
    const targetBotLink = 'https://t.me/listers_bot';
    var mesg = '>Щоб задати питання напишіть: /ask ваше_питання.\n\n' +
      ' Наприклад: \n<b>/ask Привіт, хто є адміністратором цих ботів?</b>\n\n' +
      '>Щоб перевірити відповідь на ваше питання або пропозицію - натисніть "Запитання і пропозиції".';
    const keyboard = {
      inline_keyboard: [
        [
          { text: '\uD83D\uDCDC Запитання і пропозиції', callback_data: 'tickets' }
        ],
        [
          { text: `${emodji.back} Повернутись до основного бота`, url: `${targetBotLink}` }
        ]
      ],
    };
    if (message.text !== mesg ) {
      bot_help.editMessageText(mesg, { chat_id: message.chat.id, message_id: message.message_id, reply_markup: keyboard,  parse_mode: "HTML" });
    }
    bot_help.answerCallbackQuery(callbackQuery.id, );
}
async function findTicketsByIdAndAnswer(_id) {
 
  try {
    const db = client.db('test');
    const collection = db.collection('ticket');
    const query = { id: _id, answer: { $ne: 'deleted' } };
    const tickets = await collection.find(query).toArray();
    console.log('Результати пошуку:', tickets);
    return tickets;
  } catch (error) {
    console.error('Помилка:', error);
  }
}
async function findTicketsByIdforAnswer() {
 
  try {
    const db = client.db('test');
    const collection = db.collection('ticket');
    const query = { answer: `waiting` } ;
    const tickets = await collection.find(query).toArray();
    console.log('Результати пошуку:', tickets);
    return tickets;
  } catch (error) {
    console.error('Помилка:', error);
  }
}
function open_ask(msg){
  findTicketsByIdforAnswer().then(tickets =>{
    var mesg = ``;
    tickets.slice(0, 10).forEach(obj => {
      mesg = `${mesg}|| №${obj.number} || -> ${obj.question}\n  \n`;
    });
    if(mesg == ``){
      bot_help.sendMessage(msg.chat.id, `Поки питань немає)`)
    }
    
    else if(mesg !== ``){   
       bot_help.sendMessage(msg.chat.id, mesg)
      }
  })
}


function generateQuestionB1uttons(questions) {
    const buttons = [];
  
    questions.forEach((question) => {
      const buttonText = `Питання №${question.number}`;
      const callbackData = `open_question:${question._id}`;
      const button = [{ text: buttonText, callback_data: callbackData }];
      buttons.push(button);
    });
    buttons.push([{ text: `${emodji.back} Повернутись назад`, callback_data: 'menu' }])
    const keyboard = { inline_keyboard: buttons };
    return keyboard;
}
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

    // Додавання рядка з 5 кнопками
    if ((index + 1) % 2 === 0) {
      buttons.push(row);
      row = [];
    }
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
async function getDocumentById(documentId) {
    try {
  
      const database = client.db('test'); // Замініть на назву вашої бази даних
      const collection = database.collection(`ticket`);
  
      const query = { _id: new ObjectId(documentId) };
      const document = await collection.findOne(query);
      return document;
    } finally {
    }
}
function openDocument(callbackQuery,doc)
{
    const message = callbackQuery.message;
    var mesg = `Номер: ${doc.number}\n`
    + `> Запитання: \n${doc.question}\n> Відповідь:\n`;
    
    if(doc.answer == `waiting`){ 
      mesg = mesg + `Нажаль, відповіді ще немає, але скоро ми Вам відповімо!`
    }
    else
    {
      mesg = mesg + `${doc.answer}`
    }
      
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: `${emodji.back} Повернутись назад`, callback_data: 'tickets' }
        ],
        [
          { text: `${emodji.delete} Видалити`, callback_data: `delete_ticket:${doc.number}` }
        ]
        
      ],
    };
    // Відправлення повідомлення з клавіатурою
    bot_help.editMessageText(mesg, { chat_id: message.chat.id, message_id: message.message_id, reply_markup: keyboard });
}
async function setAnswerDelete(id_user) {
    try {
      
      const database = client.db("test");
      const accounts = database.collection("ticket");;
      const filter = { _id:new ObjectId(id_user)};
      const updateDoc = {
        $set: {
          answer: `deleted`
        },
      };
      const result = await accounts.updateOne(filter, updateDoc);
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
      );
    } finally {
      
    }
  }
async function setAnswerDeleteByNumber(_number) {
    try {
      
      const database = client.db("test");
      const accounts = database.collection("ticket");;
      const filter = { number: parseInt(_number)};
      const updateDoc = {
        $set: {
          answer: `deleted`
        },
      };
      const result = await accounts.updateOne(filter, updateDoc);
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
      );
      return _number
    } finally {
      
    }
  }
async function setAnswerRestorByNumber(_number) {
    try {
      
      const database = client.db("test");
      const accounts = database.collection("ticket");;
      const filter = { number: parseInt(_number)};
      const updateDoc = {
        $set: {
          answer: `waiting`
        },
      };
      const result = await accounts.updateOne(filter, updateDoc);
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
      );
      return _number
    } finally {
      
    }
  }
async function setAnswerDelete(id_user) {
    try {
      
      const database = client.db("test");
      const accounts = database.collection("ticket");;
      const filter = { _id:new ObjectId(id_user)};
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          answer: `deleted`
        },  
      };
      const result = await accounts.updateOne(filter, updateDoc, options);
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
      );
    } finally {
      
    }
  }
  async function updateAnswerByNumber(_number, _answer) {
    try {
      const db = client.db('test');
      const collection = db.collection('ticket');
      const query = { number: parseInt(_number) };
      const update = { $set: { answer: _answer } };
      const result = await collection.updateOne(query, update);
      console.log('Оновлення успішне');
      console.log(result);
      return result.modifiedCount;
    } catch (error) {
      console.error('Помилка:', error);
    }
  }
module.exports = {updateAnswerByNumber,
  setAnswerRestorByNumber, setAnswerDeleteByNumber, open_ask, open_menu, setAnswerDelete,openDocument,
  open_tickets, getDocumentById, getCountOfDocuments, generateQuestionButtons, 
  addTicket, add_question_to_db, main_menu, findTicketsByIdAndAnswer
};