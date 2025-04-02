
const {admins_id, bot_help} = require("./const.js")
const {  updateAnswerByNumber, setAnswerRestorByNumber,setAnswerDeleteByNumber, open_ask, open_menu, setAnswerDelete,openDocument, open_tickets, getDocumentById,generateQuestionButtons,add_question_to_db, main_menu, findTicketsByIdAndAnswer} = require("./functions_for_help_bot.js")
// starting the help bot
bot_help.onText(/^\/start/, (msg) => {
  main_menu(msg)
});
// main menu 
bot_help.onText(/^\/menu/, (msg) => {
  main_menu(msg)
});
// handling the /ask command for adding the question to the database
bot_help.onText(/^\/ask(.*)/, (msg,match) => {
  add_question_to_db(msg,match)
});  
// handling the /lastask command for showing the tickets to the admins
bot_help.onText(/^\/lastask/, (msg) => {
  var message = msg.chat.id
  if (admins_id.indexOf(String(message)) !== -1){ open_ask(msg) }
  else { /*bot_help.sendMessage(msg.chat.id, `У вас немає доступу до цієї команди`)*/ }
});  
// handling the /delete command for deleting the question by number
bot_help.onText(/^\/delask(.*)/, (msg,match) => {
  var message = msg.chat.id
  if (admins_id.indexOf(String(message)) !== -1) {
    setAnswerDeleteByNumber(match[1].trim()).then(
      number => { bot_help.sendMessage(msg.chat.id, `Питання №${number} видалено`) })
  }
  else { /*bot_help.sendMessage(msg.chat.id, `У вас немає доступу до цієї команди)`)*/ }
}); 
// handling the /resask command for restoring the question by number
bot_help.onText(/^\/resask(.*)/, (msg,match) => {
  var message = msg.chat.id
  if (admins_id.indexOf(String(message)) !== -1){
    setAnswerRestorByNumber(match[1].trim()).then(
      number => { bot_help.sendMessage(msg.chat.id, `Питання №${number} відновлено`) })
  }
  else { /*bot_help.sendMessage(msg.chat.id, `У вас немає доступу до цієї команди)`)*/ }
});  
// handling the /id command for showing the id of the user
bot_help.onText(/^\/id/, (msg) => {
  bot_help.sendMessage(msg.chat.id, `Ваш id: ${msg.chat.id}`)
});  
// handling the /answ command for updating the answer by number for admins
bot_help.onText(/^\/answ \b(.*)\b (.*)/, (msg, match) => {
  updateAnswerByNumber(match[1], match[2])
});

bot_help.on('callback_query', (callbackQuery) => {
  const message = callbackQuery.message;
  const data1 = callbackQuery.data;

  if (callbackQuery.data === 'tickets') { open_tickets(callbackQuery, 1) } // open the tickets
  if (callbackQuery.data === `menu`) { open_menu(callbackQuery) } // open the main menu
  else if (callbackQuery.data === 'back_to_tickets') { open_tickets(callbackQuery, 1) }// back to the tickets
  else if (data1.startsWith('open_question:')) { // open the question
    const id_list = data1.split(':')[1];
    getDocumentById(id_list).then(doc => { openDocument(callbackQuery,doc) })
  }
  else if (data1.startsWith('next_page:')) {// next page tickets
    const page = data1.split(':')[1];
    open_tickets(callbackQuery, page)
  }
  else if (data1.startsWith('previous_page:')) {// previous page tickets
    const page = data1.split(':')[1];
    open_tickets(callbackQuery, page)
  }
  else if (data1.startsWith('delete_ticket:')) {// delete the ticket by number
    const number = data1.split(':')[1];
    setAnswerDeleteByNumber(number).then( setTimeout(open_tickets,1000,callbackQuery, 1))
  }
});