const {profile, confirm_menu, createInlineKeyboardForProducts, edit_list, delete_list, 
  getSectionNames,updateDocumentsWithWaitingNameToNull, addList, lists_out, share_list_confirm,share_list,
  openListbykeys,openShareListbykeys_for_admins, openList, list_names, getLists, lists, getProd,
  menu, settings, reminder,  off_reminder, on_reminder, addUser,say,
  logOut, getUser, setAuthUser,add_product,name_change_waiting,
  createInlineKeyboardForSections, open_section, add_element_to_list,
  name_change_update, findPublicDocuments,open_shared_lists,openShareListbykeys_for_user,
password,login} = require("./functions_for_main_bot.js")
const {admins_id,links,emodji, client, bot, responce_answer} = require("./const.js")
const start_help_bot = require('./help_bot.js');
client.connect();
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const photoUrl = links.auth;
  const text = 'Привіт! Вітаю Вас у чат-боті для списків продуктів. '+
  'Щоб почати користуватись нашим сервісом, нам потрібно зареєструвати Вас в системі. \n'+
  'Щоб зареєструватись введіть команду: \n/pass ваш_пароль';
  const options = { caption: text };
  bot.sendPhoto(chatId, photoUrl, options);
});
bot.onText(/^\/name(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  name_change_update(msg, msg.chat.id, match[1])
});
bot.onText(/^\/l(.*)/, (msg, match) => {
  login(msg.chat.id,match)
});

bot.onText(/^\/menu/, (msg) => {
  const photoUrl = links.main_menu;
  const keyboard = {
    inline_keyboard: [
      [{ text: `${emodji.profile} Профіль`, callback_data: 'profile' }],
      [{ text: `${emodji.list} Списки`, callback_data: 'lists' }],
      [{ text: `${emodji.settings} Налаштування`, callback_data: 'settings' }],
    ],
  };
  bot.sendPhoto(msg.chat.id, photoUrl, { reply_markup: keyboard });
});

bot.onText(/^\/pass(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  password(chatId,match);
});

bot.on('polling_error', (err) => console.log(err));

bot.on('callback_query', (callbackQuery) => {
  const message = callbackQuery.message;
  const data1 = callbackQuery.data;
  const chatId = callbackQuery.from.id;
  
  if (callbackQuery.data === 'help') {
    const message = callbackQuery.message;
    const targetBotLink = 'https://t.me/help_listers_bot';
    const targetBotLinkForMesg = 'https://t.me/help\\_listers\\_bot';
    const photoUrl = links.help;
    var mesg = `На рахунок питань і пропозицій звертайтесь до служби підтримки:\n> ${targetBotLinkForMesg}`;
    
    const keyboard = {
      inline_keyboard: [
        [{ text: `${emodji.back} Назад`, callback_data: 'settings' },
         { text: 'Підтримка', url: `${targetBotLink}` },],
      ],
    };
    const options = { chatId: message.chat.id, message_id: message.message_id, reply_markup: keyboard };
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0); }
      else if(user.auth == true){
        if (message.caption !== mesg || message.photo[0].file_id !== photoUrl) {
          bot.editMessageMedia({ type: 'photo', media: photoUrl, caption: mesg, parse_mode: 'Markdown' }, options);
        }
      }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); }); 
    bot.answerCallbackQuery(callbackQuery.id);
  }
  else if (callbackQuery.data === 'menu') {
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0); }
      else if(user.auth == true){ menu(callbackQuery); }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (callbackQuery.data === 'settings') {
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0); }
      else if(user.auth == true){ settings(callbackQuery); }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (callbackQuery.data === 'reminder') {
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0) }
      else if(user.auth == true){ reminder(callbackQuery); }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (callbackQuery.data === 'off_reminder') {
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0) }
      else if(user.auth == true){ off_reminder(callbackQuery); }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (callbackQuery.data === 'on_reminder') {
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0) }
      else if(user.auth == true){ on_reminder(callbackQuery); }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (callbackQuery.data === 'logout') {
    logOut(message.chat.id);
    bot.answerCallbackQuery(callbackQuery.id);
  }
  else if (callbackQuery.data === 'lists') {
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0); }
      else if(user.auth == true) { lists(callbackQuery) }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  } 
  else if (callbackQuery.data === 'open_shared_lists') {
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0); }
      else if(user.auth == true) { open_shared_lists(callbackQuery) }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  } 
  
  else if (callbackQuery.data === 'list_add') {
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0); }
      else if(user.auth == true){ addList(callbackQuery) }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (callbackQuery.data === 'profile') {
    getUser(chatId).then(user => {
      if(user.auth !== true) { say(chatId, 0); }
      else if(user.auth == true) { profile(callbackQuery) }
      else if(user.auth == null) { setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  
  else if (callbackQuery.data === 'lists_out') {
    getUser(chatId).then(user => {
      if(user.auth !== true) { say(chatId, 0); }
      else if(user.auth == true) { lists_out(callbackQuery, ``, 1) }
      else if(user.auth == null) { setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (callbackQuery.data === 'count_to_add') {
    bot.answerCallbackQuery(callbackQuery.id, { text: '~§ Це кількість продукту, яку буде додано до Вашого списку §~' });
  }
  else if (callbackQuery.data === 'list_name') {
    bot.answerCallbackQuery(callbackQuery.id, { text: '~§ Це назва Вашого списку §~' });
  }
  else if (callbackQuery.data === 'list_total_price') {
    bot.answerCallbackQuery(callbackQuery.id, { text: '~§ Це загальна ціна Вашого списку §~' });
  }
  else if (callbackQuery.data === 'list_name1') {
    bot.answerCallbackQuery(callbackQuery.id, { text: '~§ Це назва списку §~' });
  }
  else if (callbackQuery.data === 'list_total_price1') {
    bot.answerCallbackQuery(callbackQuery.id, { text: '~§ Це загальна ціна списку §~' });
  }
  else if (data1.startsWith('openlist:')) {
    const id_list = data1.split(':')[1];
    getUser(chatId).then(user => {
      if(user.auth !== true) { say(chatId, 0); }
      else if(user.auth == true) { openList(id_list).then(list => { openListbykeys(callbackQuery, list) }); }
      else if(user.auth == null) { setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (data1.startsWith('delete_list:')) {
    const id_list = data1.split(':')[1];
    getUser(chatId).then(user => {
      if(user.auth !== true) { say(chatId, 0); }
      else if(user.auth == true) { delete_list(id_list).then(result => { lists_out(callbackQuery, `Список видалено`, 1) }); }
      else if(user.auth == null) { setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (data1.startsWith('delete_list_adm:')) {
    const id_list = data1.split(':')[1];
    getUser(chatId).then(user => {
      if(user.auth !== true) { say(chatId, 0); }
      else if(user.auth == true) { delete_list(id_list).then(result => { open_shared_lists(callbackQuery) }); }
      else if(user.auth == null) { setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (data1.startsWith('edit_list:')) {
    const _id = data1.split(':')[1];
    getUser(chatId).then(user => {
      if(user.auth !== true) { say(chatId, 0); }
      else if(user.auth == true) { edit_list(callbackQuery, _id) }
      else if(user.auth == null) { setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (data1.startsWith('next_page:')) {
    const page = data1.split(':')[1];
    const _id = data1.split(':')[2];
    getUser(chatId).then(user => {
      if(user.auth !== true) { say(chatId, 0); }
      else if(user.auth == true) { add_product(callbackQuery, _id, page) }
      else if(user.auth == null) { setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (data1.startsWith('previous_page:')) {
    const page = data1.split(':')[1];
    const _id = data1.split(':')[2];
    getUser(chatId).then(user => {
      if(user.auth !== true) { say(chatId, 0); }
      else if(user.auth == true) { add_product(callbackQuery, _id, page) }
      else if(user.auth == null) { setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (data1.startsWith('nextlists_page:')) {
    const page = data1.split(':')[1];
    //const _id = data1.split(':')[2];
    getUser(chatId).then(user => {
      if(user.auth !== true) { say(chatId, 0); }
      else if(user.auth == true) { lists_out(callbackQuery, ``, page) }
      else if(user.auth == null) { setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (data1.startsWith('prevlists_page:')) {
    const page = data1.split(':')[1];
    getUser(chatId).then(user => {
      if(user.auth !== true) { say(chatId, 0); }
      else if(user.auth == true) { lists_out(callbackQuery, ``, page) }
      else if(user.auth == null) { setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (data1.startsWith('change_name:')) {
    const message = callbackQuery.message;
    const _id = data1.split(':')[1];
    getUser(chatId).then(user => {
      
      if(user.auth !== true) { say(chatId, 0); }
      else if(user.auth == true) { 
        updateDocumentsWithWaitingNameToNull(callbackQuery.from.id).then(
        name_change_waiting(_id).then(() =>{
          const photoUrl = links.name_change;
              const text = `Вітаю, залишилось написати ім'я.\nЩоб змінити ім'я списку напишіть:\n/name ім'я_списку`;
              const options = { caption: text };
              bot.sendPhoto(callbackQuery.from.id, photoUrl, options);
          bot.answerCallbackQuery(callbackQuery.id)}
        ))
      }
      else if(user.auth == null) { setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
   }
  else if (data1.startsWith('add_product:')) {
    const _id = data1.split(':')[1];
    const page = data1.split(':')[2];
    getUser(chatId).then(user => {
      if(user.auth !== true) { say(chatId, 0); }
      else if(user.auth == true) { add_product(callbackQuery, _id, page) }
      else if(user.auth == null) { setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }  
  else if (data1.startsWith('previous_page_:')) {
    const page = data1.split(':')[1];
    const _id = data1.split(':')[2];
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0) }
      else if(user.auth == true){ add_product(callbackQuery, _id, page); }
      else if(user.auth == null){setAuthUser(chatId, false); say(chatId, 1);}
    }).catch(err => { console.error(err); });
  }
  else if (data1.startsWith('add_product_:')) {
    const _id = data1.split(':')[1];
    const page = data1.split(':')[2];
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0); }
      else if(user.auth == true){ add_product(callbackQuery, _id, page) }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }  
  else if (data1.startsWith('open_section:')) {
    const name_sect = data1.split(':')[1];
    const id_sect = data1.split(':')[2];
    const _id = data1.split(':')[3];
    const page = data1.split(':')[4];
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0) }
      else if(user.auth == true){ open_section(callbackQuery, name_sect, _id, id_sect,page) }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (data1.startsWith('share_list:')) {
    const _id = data1.split(':')[1];
    getUser(chatId).then(user => {
      if(user.auth !== true){say(chatId, 0)}
      else if(user.auth == true) { share_list_confirm(callbackQuery, _id) }
      else if(user.auth == null) { setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  } 
  else if (data1.startsWith('share_list_true:')) {
    const _id = data1.split(':')[1];
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0); }
      else if(user.auth == true){ 
        share_list( true,_id)
        lists_out(callbackQuery, ``, 1)
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Вітаємо, Ваш список доданий до загального доступу!' });
      }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  } 
  else if (data1.startsWith('share_list_false:')) {
    const _id = data1.split(':')[1];
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0); }
      else if(user.auth == true){ 
        share_list( false,_id)
        lists_out(callbackQuery, ``, 1)
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Вітаємо, Ваш список видалений з загального доступу!' });
      }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  } 
  else if (data1.startsWith('count_new:')) {
    const name = data1.split(':')[1];
    const _id = data1.split(':')[2];
    const count = parseInt(data1.split(':')[3]);
    const id_sect = parseInt(data1.split(':')[4]);
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0); }
      else if(user.auth == true){ 
        if(count !== 0){ confirm_menu(callbackQuery,name,_id, count,id_sect) }
        else if(count == 0){ bot.answerCallbackQuery(callbackQuery.id,{ text: `Додати до списку можна не менше, ніж 1 продукт`}); }}
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }
  else if (data1.startsWith('add_to_list:')) {
    const _id = data1.split(':')[1];
    const count = data1.split(':')[2];
    const name_prod = message.caption;
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0) }
      else if(user.auth == true){ add_element_to_list(callbackQuery,name_prod,count,_id) }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1);}
    }).catch(err => { console.error(err); });
  }
  else if(data1.startsWith('add_conf:')) {
    const id_sect = data1.split(':')[1];//  id section
    const name = data1.split(':')[2]; // id product
    const _id = data1.split(':')[3]; // user id
    const count = data1.split(':')[4]; // product count for add
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0) }
      else if(user.auth == true){ confirm_menu(callbackQuery,name, _id, count, id_sect) }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); })
  }  
  else if(data1.startsWith('open_shared_list:')) {
    const _id = data1.split(':')[1];
    var id = callbackQuery.from.id
    getUser(chatId).then(user => {
      if(user.auth !== true){ say(chatId, 0) }
      else if(user.auth == true){ 
        if (admins_id.indexOf(String(id)) !== -1){ openList(_id).then(list => { openShareListbykeys_for_admins(callbackQuery,list)}); }
        else { openList(_id).then(list => { if(list !== null) { openListbykeys(callbackQuery, list) }}); }
      }
      else if(user.auth == null){ setAuthUser(chatId, false); say(chatId, 1); }
    }).catch(err => { console.error(err); });
  }  
});