const {links, bcrypt, ObjectId,emodji, client, bot_help, bot, responce_answer} = require("./const.js")
function logOut(chatId)
{
  getUser(chatId).then(user => {
      
    if(user.auth !== true)
    {
      say(chatId, `<b>Ви ще не авторизувались. Щоб увійти напишіть:</b>\n<i> /l Ваш_пароль</i>`)
    }
    else if(user.auth == true)
    {
      setAuthUser(chatId, false)
      say(chatId, `<b>Вітаю, Ви вийшли з акаунту.</b>`)
    }
    else if(user.auth == null)
    {
      setAuthUser(chatId, false)
      say(chatId, `<b>Ви ще не зареєстровані, зареєструйтесь командою:</b>\n/pass Ваш_пароль`)
    }
  }).catch(err => {
    console.error(err);
  });
}
function get_total_price(list) {
  let total_price = 0;
  console.log(`list`)
  console.log(list)
  if (Object.keys(list).length === 0) {
    return 0;
  }
  
  Object.values(list).forEach((item) => {
    const parts = item.name.split(' - ');
    const item_price = parseFloat(parts[1]) * parseInt(item.count);
    console.log(parseInt(item.count));
    console.log(parts[1]);
    total_price += item_price;
  });
  
  return total_price.toFixed(2);
}
function lists_out(callbackQuery, text_, page){
  getLists(callbackQuery).then(list => { 
    if(list != 0)
    {
      var namesOfList = []
      for(i = 0 ;i<list.length;i++)
      {
        
        namesOfList.push({
          text: list[i].name_list,
          callback_data: `openlist:${list[i]._id}`
        });
      }
     list_names(callbackQuery,namesOfList, text_, page)
    }
  }); 
}
async function addUser(id_user,pass) {
    try {
      const database = client.db("test");
      const accounts = database.collection("accounts");
      const filter = { id: id_user };
      const options = { upsert: true  };
      const updateDoc = {
        $set: {
          password: pass,
          id: id_user
        },
      };
      const result = await accounts.updateOne(filter, updateDoc, options);
    } finally {
      
    }
}

async function addList(callbackQuery) {
    try {
      const id_user = callbackQuery.from.id
      getListsByIDUser(id_user).then(list => { 
        var namesOfList = []
        if(list.length !== 0)
        {
          
          for(var i = 0 ;i<list.length;i++)
          {
            namesOfList.push(list[i].name_list);
          }
        }
        var y = 1;
        while (namesOfList.includes(`Unnamed${y}`)) {
          y++;
        }
        
        //namesOfList.push(`Unnamed${i}`);
        createNewList(id_user,`Unnamed${y}`).then(name_list => { 
          edit_list(callbackQuery, name_list)
        });
        
      });
      
     
    } finally {
      
    }
}
function edit_list(callbackQuery, _name) {
  const photoUrl = links.edit_list
   openList(_name).then(list => {
    const name_list = `${emodji.name} Назва: `+ list.name_list;
    const _id = list._id
    const message = callbackQuery.message
    delete list['_id'];delete list['name_change'];delete list['id'];delete list['public'];delete list['name_list'];
    const total_price = emodji.money +' Загальна ціна: '+ get_total_price(list) +' грн';
    console.log(list);
    var mesg = Object.values(list).map((value, index) => `${index + 1}. ${value.name} грн (${value.count} шт.)`).join('\n');
    //console.log(mesg);
    var keyboard;
    if(mesg == 0)
    {
      mesg = `Ваш список пустий`
      keyboard = {
        inline_keyboard: [
          [
            { text: name_list, callback_data: 'list_name' }
          
          ],
          [
            { text: total_price, callback_data: 'list_total_price' }
          
          ],[
            { text: `${emodji.edit_name} Змінити ім'я списку`, callback_data: `change_name:${_id}` }
          ],
          [
            { text: `${emodji.add_product} Додати новий продукт`, callback_data: `add_product:${_id}:1` }
          ],
          [
            { text: `${emodji.back} Повернутись назад`, callback_data: 'lists' }
          ]
  
        ],
      }; 
    }
    else
    {
      keyboard = {
        inline_keyboard: [
          [
            { text: name_list, callback_data: 'list_name' }
          
          ],
          [
            { text: total_price, callback_data: 'list_total_price' }
          
          ],
          [
            { text: `${emodji.edit_name} Змінити ім'я списку`, callback_data: `change_name:${_id}` }
          ],
          [
            { text: `${emodji.add_product} Додати новий продукт`, callback_data: `add_product:${_id}:1` }
          ],
          [
            { text: `${emodji.back} Повернутись назад`, callback_data: 'lists' }
          ]
  
        ],
      };
    }
    const options = {
      chat_id: message.chat.id,
      message_id: message.message_id,
      reply_markup: keyboard,
      parse_mode: 'Markdown',
      caption: mesg // Add the caption property
    };
  
    // Check if changes occurred in the message and reply_markup
    if (message.photo) {
      // Edit the photo
      bot.editMessageMedia({ type: 'photo', media: photoUrl }, options)
        .then(() => {
          // Edit the caption separately
          bot.editMessageCaption(mesg, options);
        })
        .catch((error) => {
          console.error('Error editing message media:', error);
        });
    }
    bot.answerCallbackQuery(callbackQuery.id);
    });
}
async function createNewList(id_user, _name) {
  try {
    
    const database = client.db("test");
    const lists = database.collection("lists");
    const doc = {
      name_list: _name,
      id: id_user,
      public: false
    }
    const result = await lists.insertOne(doc);
    return result.insertedId
    
  } finally {
    
  }
}
async function getProd(_name) {
    try {
      
      const database = client.db("test");
      const accounts = database.collection("products");
      const filter = { prod_sect: _name };
      const result = await accounts.findOne(filter)
      return result;
    } finally {
      
    }
}
async function getSectionNames() {
  try {
    const database = client.db("test");
    const products = database.collection("products");
    const query = {};
    const options = {
      sort: { name_sect: 1 },
      projection: { _id: 0, prod_sect: 1, name_sect: 1 },
    };

    const documents = await products.find(query, options).toArray();
    const names = documents.map((doc) => doc.prod_sect);
    console.log("Names:", names);
    return names;
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
} 
async function getSectionNamesUkr() {
  try {
    const database = client.db("test");
    const products = database.collection("products");
    const query = {};
    const options = {
      sort: { name_sect: 1 },
      projection: { _id: 0, name_sect: 1 },
    };

    const documents = await products.find(query, options).toArray();
    const names = documents.map((doc) => doc.name_sect);
    console.log("Names:", names);
    return names;
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
} 
async function getLists(callbackQuery) {
    try {
      const _id = callbackQuery.from.id
      const database = client.db("test");
      const accounts = database.collection("lists");
      const query = { id: _id };
      
      const cursor = accounts.find(query)
      if (await accounts.countDocuments(query) === 0) {
        lists(callbackQuery)
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Нажаль, у Вас ще немає створених списків' });
        return 0;
      }
      else{
        const docs = await cursor.toArray();
      docs.forEach(doc => {
      console.dir(doc);
      });
      console.dir(docs);
      return docs;
      }
    } finally {
      
    }
}
async function getListsByIDUser(_id) {
    try {
      const database = client.db("test");
      const accounts = database.collection("lists");
      const query = { id: _id };
      const options = {
        sort: { name_list: 1 },
      };
      const cursor = accounts.find(query, options)
      const docs = await cursor.toArray();
      docs.forEach(doc => {
      console.dir(doc);
      });
      console.dir(docs);
      return docs;
    } finally {
      
    }
}

async function share_list(bool, _id_) {
    try {
      const database = client.db("test");
      console.log(_id_)
      const lists = database.collection("lists");
      const filter = { _id: new ObjectId(_id_)};
      const updateDoc = {
        $set: {
          public: bool
        },
      };
      const result = await lists.updateOne(filter, updateDoc);
      return result;
    } finally {
      
    }
}
async function openList(_id_) {
    try {
      const database = client.db("test");
      const lists = database.collection("lists");
      const query = { _id: new ObjectId(_id_)};
      const list = await lists.findOne(query);
      return list;
    } finally {
      
    }
}
async function getUser(id_user) {
    try {
      
      const database = client.db("test");
      
      const accounts = database.collection("accounts");
      const query = { id: id_user };
    
      const user = await accounts.findOne(query);
      return user;
      } finally {
      
    }
  }
  async function setAuthUser(id_user, bool) {
    try {
      
      const database = client.db("test");
      const accounts = database.collection("accounts");;
      const filter = { id: id_user};
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          id: id_user,
          auth: bool
        },
      };
      const result = await accounts.updateOne(filter, updateDoc, options);
      
    } finally {
      
    }
  }
  async function setReminder(id_user, bool) {
    try {
      
      const database = client.db("test");
      const accounts = database.collection("accounts");;
      const filter = { id: id_user};
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          id: id_user,
          reminder: bool
        },
      };
      const result = await accounts.updateOne(filter, updateDoc, options);
      
    } finally {
      
    }
  }
  function settings(callbackQuery) {
    const message = callbackQuery.message;
    const photoUrl = links.settings;
    const keyboard = {
      inline_keyboard: [
        [
          { text: `${emodji.reminder} Нагадування`, callback_data: 'reminder' }
        ],
        [
          { text: `${emodji.help} Допомога`, callback_data: 'help' }
        ],
        [
          { text: `${emodji.back} Повернутись назад`, callback_data: 'menu' }
        ],
        [
          { text: 'Вийти з аккаунту', callback_data: 'logout' }
        ]
      ],
    };
  
    const options = {
      chat_id: message.chat.id,
      message_id: message.message_id,
      reply_markup: keyboard,
      parse_mode: 'Markdown',
    };
  
    // Перевірка, чи відбулися зміни в повідомленні та reply_markup
    if (message.photo[0].file_id !== photoUrl) {
      // Зміна повідомлення з фото та клавіатурою
      bot.editMessageMedia({ type: 'photo', media: photoUrl }, options);
    }
  
    bot.answerCallbackQuery(callbackQuery.id);
  }
  
  
  function reminder(callbackQuery) {
    const message = callbackQuery.message;
    const photoUrl = links.reminder;
  
    const keyboard = {
      inline_keyboard: [
        [
          { text: 'Включити', callback_data: 'on_reminder' },
          { text: 'Виключити', callback_data: 'off_reminder' }
        ],
        [
          { text: `${emodji.back} Повернутись назад`, callback_data: 'settings' }
        ]
      ],
    };
  
    bot.editMessageMedia({ type: 'photo', media: photoUrl }, {
      chat_id: message.chat.id,
      message_id: message.message_id,
      reply_markup: keyboard
    });
  
    bot.answerCallbackQuery(callbackQuery.id);
  }
  
function name_change_update(msg, id, match)
{
  const chatId = id;
  let result = match
  match = match.trimLeft()
  //
  if(result[0] == ' '){
    if(result.length <=45){
    updateDocumentsWithWaitingName(chatId, match).then(name =>{
      var mesg =  `Ім'я вашого списку змінено на "${name}"`
      if(name== 0)
      {
        mesg = `Запиту на зміну ім'я не було. Щоб змінити ім'я Вашого списку, потрібно виконати ці пункти:\n1. Зайдіть у Ваш список\n2. Нажміть кнопку "Змінити ім'я"\n3. Введіть "/name Нове_ім'я_списку"`
      }
      updateDocumentsWithWaitingNameToNull(chatId);
      const photoUrl = links.name_change;
    
      const options = {
        caption: mesg
      };
    
      // Відправляємо повідомлення з фото за допомогою посилання
      bot.sendPhoto(chatId, photoUrl, options);
    
      }
    )
    }
    else if(result.length >=46){
      var mesg =  `Максимальна довжина ім'я списку - 45 символів.\nВаше ім'я складається з ${result.length}\nВведіть назву, яка сладається від 1 до 40 символів.`
    
      
      const photoUrl = links.name_change;
    
      const options = {
        caption: mesg
      };
    
      // Відправляємо повідомлення з фото за допомогою посилання
      bot.sendPhoto(chatId, photoUrl, options);
    
      
    }
  }
  else
  {
    if (result =='') {
      const photoUrl = links.name_change;
      const text = `Вкажіть імя списку, для цього введіть наступну команду:\n/name ім'я_списку`
    
      // Опції повідомлення (можна вказати caption для фото)
      const options = {
        caption: text
      };
    
      // Відправляємо повідомлення з фото за допомогою посилання
      bot.sendPhoto(chatId, photoUrl, options);
    }
    else 
    {

      // Посилання на фото, яке ви бажаєте надіслати
      const photoUrl = links.name_change;
    
      // Текст повідомлення
      const text = `Ви неправильно ввели команду. Спробуйте ще раз:\n /name ім'я_списку`;
    
      // Опції повідомлення (можна вказати caption для фото)
      const options = {
        caption: text
      };
    
      // Відправляємо повідомлення з фото за допомогою посилання
      bot.sendPhoto(chatId, photoUrl, options);
      
    }
  }
      
          
} 
  function login(chatId, match)
  {
    let result1 = match[1]
    
    if(match[1] == 'ogout')
    {
      logOut(chatId);
    }
    else {
      match[1] = match[1].trimLeft()
      hashPassword(match[1]).then(pass =>
        {
          var nulled = match[1]
          match[1] = pass
          getUser(chatId).then(user => {
            if(user == null)
            {
              const photoUrl = links.auth;
      
              // Текст повідомлення
              const text = `Ви ще не зареєстровані, для реєстрації введіть наступну команду:\n/pass Ваш_пароль`;
            
              // Опції повідомлення (можна вказати caption для фото)
              const options = {
                caption: text
              };
            
              // Відправляємо повідомлення з фото за допомогою посилання
              bot.sendPhoto(chatId, photoUrl, options);
            }
            else if(result1[0] == ' '){
              if(user.auth == false){
                if(user.password == match[1]) {
                  const photoUrl = links.auth;
      
                  // Текст повідомлення
                  const text = "Вітаю, Ви успішно авторизувались!\n> Ви "+
                  "можете продовжувати використовувати бота!";
                
                  // Опції повідомлення (можна вказати caption для фото)
                  const options = {
                    caption: text
                  };
                
                  // Відправляємо повідомлення з фото за допомогою посилання
                  bot.sendPhoto(chatId, photoUrl, options);
                
                setAuthUser(chatId, true)
                }
                else{
                  const photoUrl = links.auth;
      
                  // Текст повідомлення
                  const text = "Ви ввели неправильний пароль!\nСпробуйте ще раз:\n/l Ваш_пароль";
                
                  // Опції повідомлення (можна вказати caption для фото)
                  const options = {
                    caption: text
                  };
                
                  // Відправляємо повідомлення з фото за допомогою посилання
                  bot.sendPhoto(chatId, photoUrl, options);
                }
              }
              else if(user.auth == true)
              {
                const photoUrl = links.auth;
      
                  // Текст повідомлення
                  const text = "Ви уже авторизовані!";
                
                  // Опції повідомлення (можна вказати caption для фото)
                  const options = {
                    caption: text
                  };
                
                  // Відправляємо повідомлення з фото за допомогою посилання
                  bot.sendPhoto(chatId, photoUrl, options);
              }
              
            
            }
            else if(user !== null && user.auth == true){
              const photoUrl = links.auth;
      
                  // Текст повідомлення
                  const text = "Ви уже авторизовані!";
                
                  // Опції повідомлення (можна вказати caption для фото)
                  const options = {
                    caption: text
                  };
                
                  // Відправляємо повідомлення з фото за допомогою посилання
                  bot.sendPhoto(chatId, photoUrl, options);
              
              
            }
            else if(user !== null){
              if (nulled=='') {
                const photoUrl = links.auth;
      
                  // Текст повідомлення
                  const text = `Ви забули ввести пароль. Введіть команду:\n/l Ваш_пароль`;
                
                  // Опції повідомлення (можна вказати caption для фото)
                  const options = {
                    caption: text
                  };
                
                  // Відправляємо повідомлення з фото за допомогою посилання
                  bot.sendPhoto(chatId, photoUrl, options);
              }
              else 
              {
                const photoUrl = links.auth;
      
                // Текст повідомлення
                const text = `Ви неправильно ввели команду. Введіть команду:\n/l Ваш_пароль`;
              
                // Опції повідомлення (можна вказати caption для фото)
                const options = {
                  caption: text
                };
              
                // Відправляємо повідомлення з фото за допомогою посилання
                bot.sendPhoto(chatId, photoUrl, options);
              }
              
            }
            else
            {
              if (nulled =='') {
                const photoUrl = links.auth;
      
                // Текст повідомлення
                const text = `Ви ще не зареєстровані, для реєстрації введіть наступну команду:\n/pass Ваш_пароль`;
              
                // Опції повідомлення (можна вказати caption для фото)
                const options = {
                  caption: text
                };
              
                // Відправляємо повідомлення з фото за допомогою посилання
                bot.sendPhoto(chatId, photoUrl, options);
              }
              else 
              {
                const photoUrl = links.auth;
      
                // Текст повідомлення
                const text = `Ви неправильно ввели команду. Введіть команду:\n/l Ваш_пароль`;
              
                // Опції повідомлення (можна вказати caption для фото)
                const options = {
                  caption: text
                };
              
                // Відправляємо повідомлення з фото за допомогою посилання
                bot.sendPhoto(chatId, photoUrl, options);
              }
            }
          }).catch(err => {
            console.error(err);
          });  
        console.log(pass)
        })
      
    }
  }
  async function hashPassword(password) {
    // Фіксована сіль для хешування паролю
    const salt = '$2a$10$KtmPbygqZi5uK4HZ32v0Tu';
  
    // Хешування паролю за допомогою фіксованої солі
    const hashedPassword = await bcrypt.hash(password, salt);
  
    return hashedPassword;
  }
  function password(chatId, match){
    getUser(chatId).then(user => {
      var check = match[1]

      if(check[0]== undefined)
      {
        const photoUrl = links.pass;
        const text = `Ви забули ввести пароль. Введіть команду:\n/pass Ваш_пароль`;
        const options = {
          caption: text
        };
        bot.sendPhoto(chatId, photoUrl, options);
      }
      else if(user == null)
      {
        console.log('121212ba')
        match[1] = match[1].trimLeft();
        hashPassword(match[1]).then(pass =>
          {
            addUser(chatId, pass).catch(console.dir);
            const photoUrl = links.pass;
            const text = "Вітаю, Ваш пароль змінено!\nВи можете продовжувати використовувати бота!\nP.s Цією командою можна змінити пароль у будь-який момент";
            const options = {
              caption: text
            };
            bot.sendPhoto(chatId, photoUrl, options);
            setAuthUser(chatId, true) ;
          console.log(pass)
          })
        
      }
      else if(user.auth == true && check[0] == ' '){
        console.log('1212a')
        console.log(match[1])
        if(match[1] !== ''){
          match[1] = match[1].trimLeft()
          hashPassword(match[1]).then(pass =>
            {
              addUser(chatId, pass).catch(console.dir);
              const photoUrl = links.pass;
              const text = "Вітаю, Ваш пароль змінено!\nВи можете продовжувати використовувати бота!\nP.s Цією командою можна змінити пароль у будь-який момент";
              const options = {
                caption: text
              };
              bot.sendPhoto(chatId, photoUrl, options);
              setAuthUser(chatId, true) ;
            console.log(pass)
            })
          
        }
        else{
          const photoUrl = links.pass;
            const text = `Ви неправильно ввели команду. Введіть команду:\n/pass Ваш_пароль`;
            const options = {
              caption: text
            };
            bot.sendPhoto(chatId, photoUrl, options);
        }
        
        
        
      }
      else if(user.auth === false)
      {
        const photoUrl = links.pass;
        const text = `Для того, щоб  змінити пароль вам потрібно авторизуватись. Введіть команду:\n> /l Ваш_пароль`;
        const options = {
          caption: text
        };
        bot.sendPhoto(chatId, photoUrl, options);
      }
      else
      {
        if (match[1]=='') {
          const photoUrl = links.pass;
          const text = `Ви забули ввести пароль. Введіть команду:\n/pass Ваш_пароль`;
          const options = {
            caption: text
          };
          bot.sendPhoto(chatId, photoUrl, options);
        }
        else 
        {
          const photoUrl = links.pass;
          const text = `Ви неправильно ввели команду. Введіть команду:\n/pass Ваш_пароль`;
          const options = {
            caption: text
          };
          bot.sendPhoto(chatId, photoUrl, options);
        }
      }
    }).catch(err => {
      console.error(err);
    });  
   
  }
  function off_reminder(callbackQuery)
  {
    const message = callbackQuery.message
     var mesg = 'Нагадування виключено'
     const keyboard = {
       inline_keyboard: [
         [
           { text: 'Включити', callback_data: 'on_reminder' },
           { text: 'Виключити', callback_data: 'off_reminder' }
         ],
         [
           { text: `${emodji.back} Повернутись назад`, callback_data: 'settings' }
         ]
       ],
     }; 
     setReminder(callbackQuery.from.id, false).then(
       bot.answerCallbackQuery(callbackQuery.id, {text: mesg})
       )
     
     
     
  }
  function add_product(callbackQuery, _id, _page) {
    const photoUrl = links.change_sect;
    getSectionNames().then(buttons => {
      getSectionNamesUkr().then(name_sect => {
        for (i = 0; i < buttons.length; i++) {
          buttons[i] = { text: name_sect[i], callback_data: `open_section:${buttons[i]}:${i}:${_id}:1` };
        }
        var x = buttons.length;
        var totalpages = Math.round(x / 8);
        if (x % 8 <= 3 && x % 8 !== 0) {
          totalpages += 1;
        }
  
        const keyboard = createInlineKeyboardForSections(buttons, _page, totalpages, _id);
        console.log(JSON.stringify(keyboard));
        const message = callbackQuery.message;
  
        const options = {
          chat_id: message.chat.id,
          message_id: message.message_id,
          reply_markup: keyboard,
        };
  
        bot.editMessageMedia({ type: 'photo', media: photoUrl }, options)
          .catch((error) => {
            console.error('Error editing message media:', error);
          });
      });
    });
  }
  
  async function name_change_waiting(id_user) {
    try {
      const database = client.db("test");
      const accounts = database.collection("lists");
      const filter = { _id: new ObjectId(id_user) };
      const updateDoc = {
        $set: {
          name_change: "waiting"
        }
      };
      const result = await accounts.updateOne(filter, updateDoc);
      console.log(result)
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
      );
    } catch (error) {
      console.log("Error updating document:", error);
    }
  }
  async function updateDocumentsWithWaitingName(id_user, name) {
    try {
      const database = client.db("test");
      const lists = database.collection("lists");
      const documents = await lists.find({ id: id_user, name_change: 'waiting' }).toArray();
      if(documents.length == 0){return 0}
      for (const document of documents) {
        document.name_list = name;
        await lists.updateOne({ _id: document._id }, { $set: { name_list: name } });
      }
      if(documents.length == 0)
      console.log(name)
      return name;
    } catch (error) {
      console.log('Error updating documents:', error);
    }
  }
  async function updateDocumentsWithWaitingNameToNull(_id_) {
    try {
      const database = client.db("test");
      const lists = database.collection("lists");
      const documents = await lists.find({ id: _id_,name_change: 'waiting' }).toArray();
      
      for (const document of documents) {
        document.name = `null`;
        await lists.updateOne({ _id: document._id }, { $set: { name_change: `null` } });
      }
      
    } catch (error) {
      console.log('Error updating documents:', error);
    }
  }
  function on_reminder(callbackQuery)
  {
    const message = callbackQuery.message
     var mesg = 'Нагадування включено'
     const keyboard = {
       inline_keyboard: [
         [
           { text: 'Включити', callback_data: 'on_reminder' },
           { text: 'Виключити', callback_data: 'off_reminder' }
         ],
         [
           { text: `${emodji.back} Повернутись назад`, callback_data: 'settings' }
         ]
       ],
     }; 
     setReminder(callbackQuery.from.id, true).then(
      bot.answerCallbackQuery(callbackQuery.id, {text: mesg})
      )
  }
  function menu(callbackQuery) {
    const photoUrl = links.main_menu;
    const message = callbackQuery.message;
    const keyboard = {
        inline_keyboard: [
            [
                { text: `${emodji.profile} Профіль`, callback_data: 'profile' }
            ],
            [
                { text: `${emodji.list} Списки`, callback_data: 'lists' }
            ],
            [
                { text: `${emodji.settings} Налаштування`, callback_data: 'settings' }
            ],
        ],
    };
    const options = {
        chat_id: message.chat.id,
        message_id: message.message_id,
        reply_markup: keyboard,
        parse_mode: 'Markdown',
    }
    
    bot.editMessageMedia({ type: 'photo', media: photoUrl }, options);
    bot.answerCallbackQuery(callbackQuery.id);
}

function list_names(callbackQuery, list_names, text_, page) {
  const message = callbackQuery.message;
  const photoUrl = links.my_lists;
  console.log(typeof(photoUrl))
  const keyboard = createInlineKeyboard(list_names, page);
  keyboard.inline_keyboard.push([{ text: '                              Головне меню                              ', callback_data: 'menu' }]);
  console.log(keyboard)
  const options = {
    chat_id: message.chat.id,
    message_id: message.message_id,
    reply_markup: keyboard,
    parse_mode: 'Markdown',
  }
  bot.editMessageMedia({ type: 'photo', media: photoUrl }, options);
  bot.answerCallbackQuery(callbackQuery.id, { text: text_ });
}
  
  
  
function openListbykeys(callbackQuery, list) {
  console.log(list);
  const photoUrl = links.list;
  const name_list = `${emodji.name} Назва: ` + list.name_list;
  const id_list = list._id;
  const message = callbackQuery.message;
  delete list['_id'];
  delete list['name_change'];
  delete list['id'];
  delete list['public'];
  delete list['name_list'];
  const total_price = emodji.money + ' Загальна ціна: ' + get_total_price(list) + ' грн';
  var mesg = Object.values(list).map((value, index) => `${index + 1}. ${value.name} грн (${value.count} шт.)`).join('\n');

  if (mesg == 0) {
    mesg = `Цей список пустий`;
  }
  const keyboard = {
    inline_keyboard: [
      [
        { text: name_list, callback_data: 'list_name' }
      ],
      [
        { text: total_price, callback_data: 'list_total_price' }
      ],
      [
        { text: `${emodji.edit_name} Змінити ім'я`, callback_data: `change_name:${id_list}` }
      ],
      [
        { text: `${emodji.edit_list} Редагувати`, callback_data: `edit_list:${id_list}` },
        { text: `${emodji.share} Поділитися`, callback_data: `share_list:${id_list}` }
      ],
      [
        { text: `${emodji.back} Повернутись назад`, callback_data: 'lists_out' },
        { text: `${emodji.delete} Видалити список`, callback_data: `delete_list:${id_list}` },
      ]
    ],
  };
  const options = {
    chat_id: message.chat.id,
    message_id: message.message_id,
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  };
  // Check if changes occurred in the message and reply_markup
  if (message.photo) {
    // Edit the photo
    bot.editMessageMedia({ type: 'photo', media: photoUrl }, options)
      .then(() => {
        // Edit the caption separately
        bot.editMessageCaption(mesg, options);
      })
      .catch((error) => {
        console.error('Error editing message media:', error);
      });
  }
  bot.answerCallbackQuery(callbackQuery.id);
}
function openShareListbykeys_for_admins(callbackQuery, list) {
  console.log(list);
  const photoUrl = links.list;
  const name_list = `${emodji.name} Назва: ` + list.name_list;
  const id_list = list._id;
  const message = callbackQuery.message;
  delete list['_id'];
  delete list['name_change'];
  delete list['id'];
  delete list['public'];
  delete list['name_list'];
  const total_price = emodji.money + ' Загальна ціна: ' + get_total_price(list) + ' грн';
  var mesg = Object.values(list).map((value, index) => `${index + 1}. ${value.name} грн (${value.count} шт.)`).join('\n');

  if (mesg == 0) {
    mesg = `Цей список пустий`;
  }
  const keyboard = {
    inline_keyboard: [
      [
        { text: name_list, callback_data: 'list_name1' }
      ],
      [
        { text: total_price, callback_data: 'list_total_price1' }
      ],
      [
        { text: `${emodji.back} Повернутись назад`, callback_data: 'open_shared_lists' },
        { text: `${emodji.delete} Видалити список`, callback_data: `delete_list_adm:${id_list}` },
      ]
    ],
  };
  const options = {
    chat_id: message.chat.id,
    message_id: message.message_id,
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  };
  // Check if changes occurred in the message and reply_markup
  if (message.photo) {
    // Edit the photo
    bot.editMessageMedia({ type: 'photo', media: photoUrl }, options)
      .then(() => {
        // Edit the caption separately
        bot.editMessageCaption(mesg, options);
      })
      .catch((error) => {
        console.error('Error editing message media:', error);
      });
  }
  bot.answerCallbackQuery(callbackQuery.id);
}
function openShareListbykeys_for_user(callbackQuery, list) {
  console.log(list);
  const photoUrl = links.list;
  const name_list = `${emodji.name} Назва: ` + list.name_list;
  const id_list = list._id;
  const message = callbackQuery.message;
  delete list['_id'];
  delete list['name_change'];
  delete list['id'];
  delete list['public'];
  delete list['name_list'];
  const total_price = emodji.money + ' Загальна ціна: ' + get_total_price(list) + ' грн';
  var mesg = Object.values(list).map((value, index) => `${index + 1}. ${value.name} грн (${value.count} шт.)`).join('\n');

  if (mesg == 0) {
    mesg = `Цей список пустий`;
  }
  const keyboard = {
    inline_keyboard: [
      [
        { text: name_list, callback_data: 'list_name1' }
      ],
      [
        { text: total_price, callback_data: 'list_total_price1' }
      ],
      [
        { text: `${emodji.back} Повернутись назад`, callback_data: 'open_shared_lists' }
      ]
    ],
  };
  const options = {
    chat_id: message.chat.id,
    message_id: message.message_id,
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  };
  // Check if changes occurred in the message and reply_markup
  if (message.photo) {
    // Edit the photo
    bot.editMessageMedia({ type: 'photo', media: photoUrl }, options)
      .then(() => {
        // Edit the caption separately
        bot.editMessageCaption(mesg, options);
      })
      .catch((error) => {
        console.error('Error editing message media:', error);
      });
  }
  bot.answerCallbackQuery(callbackQuery.id);
}





  function add_element_to_list(callbackQuery,name_prod,count,_id){
    console.log(`_id`)
    console.log(_id)
    console.log(`count`)
    console.log(count)
    console.log(`name_prod`)
    console.log(name_prod)
    openList(_id).then(list =>{
      console.log(list)
      console.log(`Кількість:`+ Object.keys(list).length)
      delete list['_id'];delete list[`name_change`];delete list['public']; delete list['name_list'];delete list['id']
      console.log(`Кількість:`+ Object.keys(list).length)
      var index = Object.keys(list).length + 1
      var value = {name: name_prod, count: count}
      updateObjectProperty(_id, index, value).then(
        setTimeout(edit_list,1000,callbackQuery, _id)
      )
    })
    
  }
  async function updateObjectProperty(_id, index, value) {
    try {  
      const database = client.db("test");
      const lists = database.collection("lists")
  
      const filter = { _id: new ObjectId(_id) };
      const update = { $set: { [index]: value } };
  
      const result = await lists.updateOne(filter, update);
      if (result.modifiedCount > 0) {
        console.log('Властивість об\'єкта змінено');
      } else {
        console.log(`Об'єкт не знайдено`);
      }
    } catch (err) {
      console.error('Помилка при зміні властивості об\'єкта:', err);
    } finally {
    }
  }
  async function updateObjectProperty(_id, index, value) {
    try {  
      const database = client.db("test");
      const lists = database.collection("lists")
  
      const filter = { _id: new ObjectId(_id) };
      const update = { $set: { [index]: value } };
  
      const result = await lists.updateOne(filter, update);
      if (result.modifiedCount > 0) {
        console.log('Властивість об\'єкта змінено');
      } else {
        console.log('Об\'єкт не знайдено');
      }
    } catch (err) {
      console.error('Помилка при зміні властивості об\'єкта:', err);
    } finally {
    }
  }
  async function delete_list(id) {
    try {
      const database = client.db("test");
      const list = database.collection("lists");
      const result = await list.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
      return result;
    } finally {
    
    }
  }
   
  function lists(callbackQuery) {
    const message = callbackQuery.message;
    const photoUrl = links.lists;
    const keyboard = {
      inline_keyboard: [
        [
          { text: `${emodji.my_lists} Мої списки`, callback_data: 'lists_out' }
        ],
        [
          { text: `${emodji.add_new_list} Додати новий список`, callback_data: 'list_add' }
        ],
        [
          { text: `${emodji.share_lists} Списки, поширені користувачами`, callback_data: 'open_shared_lists' }
        ],
        [
          { text: `${emodji.back} Повернутись назад`, callback_data: 'menu' }
        ]
      ],
    };
  
    const options = {
      chat_id: message.chat.id,
      message_id: message.message_id,
      reply_markup: keyboard,
      parse_mode: 'Markdown',
    };
    console.log(message.photo[0].file_id)
    console.log(message.photo[0])
    console.log(message.photo)
    bot.editMessageMedia({ type: 'photo', media: photoUrl }, options);
    bot.answerCallbackQuery(callbackQuery.id);
    
  }
  
  function confirm_menu(callbackQuery, id_name, _id, count, id_sect) {
    const photoUrl = links.change_count;
    const message = callbackQuery.message;
    var count_minus = parseInt(count);
    var count_minus5 = parseInt(count);
    if (count_minus <= 1) {
      count_minus = 0;
    } else if (count_minus !== 0) {
      count_minus--;
    }
    if (count_minus5 <= 5) {
      count_minus5 = 0;
    } else if (count_minus5 !== 0) {
      count_minus5 = count_minus5 - 5;
    }
    var mesg = '';
    getSectionNames().then(name_sect => {
      getProd(name_sect[id_sect]).then(names_prod => {
        console.log('wadaw: '+names_prod[id_name].name);
        mesg = `${names_prod[id_name].name} - ${names_prod[id_name].price} грн`;
        const keyboard = {
          inline_keyboard: [
            [
              { text: `Кількість: ${count}`, callback_data: 'count_to_add' }
            ],
            [
              { text: `${emodji.plus_one}`, callback_data: `count_new:${id_name}:${_id}:${parseInt(count) + 1}:${id_sect}` },
              { text: `${emodji.plus_five}`, callback_data: `count_new:${id_name}:${_id}:${parseInt(count) + 5}:${id_sect}` },
              { text: `${emodji.minus_one}`, callback_data: `count_new:${id_name}:${_id}:${parseInt(count_minus)}:${id_sect}` },
              { text: `${emodji.minus_five}`, callback_data: `count_new:${id_name}:${_id}:${parseInt(count_minus5)}:${id_sect}` }
            ],
            [
              { text: `${emodji.add_new_list} Додати до списку`, callback_data: `add_to_list:${_id}:${count}` }
            ],
            [
              { text: `${emodji.back} Повернутись назад`, callback_data: `edit_list:${_id}` }
            ]
          ],
        };
        const options = {
          chat_id: message.chat.id,
          message_id: message.message_id,
          reply_markup: keyboard,
          parse_mode: 'Markdown'
        };
        if (message.photo) {
          // Edit the photo
          bot.editMessageMedia({ type: 'photo', media: photoUrl }, options)
            .then(() => {
              // Edit the caption separately
              bot.editMessageCaption(mesg, options);
            })
            .catch((error) => {
              console.error('Error editing message media:', error);
            });
        }
        bot.answerCallbackQuery(callbackQuery.id);
      });
    });
  }
  

  function share_list_confirm(callbackQuery, _id)
  {
    const photoUrl = links.share_confirm
    const message = callbackQuery.message
    const keyboard = {
      inline_keyboard: [
        [
          { text: `${emodji.yes} Так`, callback_data: `share_list_true:${_id}` }
        ],
        [
          { text: `${emodji.no} Ні`, callback_data: `share_list_false:${_id}` }
        ],
      ],
    };  
    const options = {
      chat_id: message.chat.id,
      message_id: message.message_id,
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    };
    // Перевірка, чи відбулися зміни в повідомленні та reply_markup
    bot.editMessageMedia({ type: 'photo', media: photoUrl }, options)
    .catch((error) => {
      console.error('Error editing message media:', error);
    });
  }
  function open_section(callbackQuery, name_sect, _id, id_sect, _page) {
    const photoUrl = links.change_prod;
    const message = callbackQuery.message;
    getProd(name_sect).then(user => {
      console.log(user);
      const keys = Object.keys(user);
      const count = keys.length;
      var list_names = [];
      for (i = 0; i < count - 3; i++) {
        list_names.push(`${user[i].name} - ${user[i].price}`);
        console.log(`${user[i].name} - ${user[i].price}`);
      }
      console.log(`list`);
      console.log(keys);
      console.log(list_names);
      var names_prod = list_names;
      for (i = 0; i < names_prod.length; i++) {
        names_prod[i] = { text: names_prod[i], callback_data: `add_conf:${id_sect}:${i}:${_id}:1` };
      }
      console.log(`name `);
      console.log(names_prod);
      var x = names_prod.length;
        var totalpages = Math.round(x / 8);
        if (x % 8 <= 3 && x % 8 !== 0) {
          totalpages += 1;
        }
      const keyboard = createInlineKeyboardForProducts(names_prod, _page, totalpages, _id);
  
      const options = {
        chat_id: message.chat.id,
        message_id: message.message_id,
        reply_markup: keyboard,
      };
  
      bot.editMessageMedia({ type: 'photo', media: photoUrl }, options)
        
    }).catch(err => {
      console.error(err);
    });
  
    bot.answerCallbackQuery(callbackQuery.id);
  }
  
  function createInlineKeyboard(buttons, currentPage) {
    const inline_keyboard = [];
    const itemsPerPage = 7;
    let startIdx = (currentPage - 1) * itemsPerPage;
    let endIdx = startIdx + itemsPerPage;
    let currentRow = [];
  
    for (let i = startIdx; i < endIdx && i < buttons.length; i++) {
      const button = buttons[i];
      const buttonObj = { text: button.text, callback_data: button.callback_data };
      currentRow.push(buttonObj);
  
      if (currentRow.length === 1) {
        inline_keyboard.push(currentRow);
        currentRow = [];
      }
    }
  
    if (startIdx > 0) {
      inline_keyboard.push([{ text: `${emodji.previous_page} Попередня сторінка`, callback_data: `prevlists_page:${parseInt(currentPage)-1}` }]);
    }
  
    if (endIdx < buttons.length) {
      inline_keyboard.push([{ text: `${emodji.next_page} Наступна сторінка`, callback_data: `nextlists_page:${parseInt(currentPage)+1}` }]);
    }
  
    return { inline_keyboard, currentPage };
  }
  function createInlineKeyboardForSections(buttons, currentPage, totalPages, _id) {
    const itemsPerPage = 8;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const inline_keyboard = [];
    console.log(currentPage)
    for (let i = startIndex; i < endIndex && i < buttons.length; i++) {
      const button = buttons[i];
      const buttonObj = { text: button.text, callback_data: button.callback_data };
      inline_keyboard.push([buttonObj]);
    }
  
    const paginationRow = [];
    if (currentPage > 1) {
      paginationRow.push({ text: `${emodji.previous_page} Попередня сторінка `, callback_data: `previous_page:${parseInt(currentPage)-1}:${_id}` });
    }
    if (currentPage < totalPages) {
      paginationRow.push({ text: `${emodji.next_page} Наступна сторінка`, callback_data: `next_page:${parseInt(currentPage)+1}:${_id}` });
    }
  
    if (paginationRow.length > 0) {
      inline_keyboard.push(paginationRow);
    }
    inline_keyboard.push([{ text: `${emodji.back} Повернутись назад`, callback_data: `edit_list:${_id}` }]);
    console.log(`tot  `+totalPages)
    console.log(`le `+buttons.length)
    return { inline_keyboard };
  }
  function createInlineKeyboardForProducts(buttons, currentPage, totalPages, _id) {
    const itemsPerPage = 8;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const inline_keyboard = [];
    console.log(currentPage)
    for (let i = startIndex; i < endIndex && i < buttons.length; i++) {
      const button = buttons[i];
      const buttonObj = { text: button.text, callback_data: button.callback_data };
      inline_keyboard.push([buttonObj]);
    }
  
    const paginationRow = [];
    if (currentPage > 1) {
      //paginationRow.push({ text: `${emodji.back} Попередня сторінка `, callback_data: `open_section:${buttons[i]}:${_id}:${parseInt(currentPage)-1}:` });
    }//open_section:${buttons[i]}:${i}:${_id}:1
    if (currentPage < totalPages) {
      //paginationRow.push({ text: `Наступна сторінка`, callback_data: `next_page_:${parseInt(currentPage)+1}:${_id}` });
    }
  
    if (paginationRow.length > 0) {
      inline_keyboard.push(paginationRow);
    }
    inline_keyboard.push([{ text: `${emodji.back} Повернутись назад`, callback_data: `add_product:${_id}:1` }]);
    console.log(`tot  `+totalPages)
    console.log(`le `+buttons.length)
    return { inline_keyboard };
  }
  async function countDocumentsById(id_name) {
    try {
      const database = client.db("test");
      const collection = database.collection("lists");
      const query = { id: id_name };
      const count = await collection.countDocuments(query);
      return count;
    } catch (error) {
      console.error('Помилка під час отримання кількості документів:', error);
      throw error;
    }
  }
  function profile(callbackQuery) {
    const firstName = callbackQuery.from.first_name;
    const lastName = callbackQuery.from.last_name;
    const message = callbackQuery.message;
    
    const photoUrl = links.profile; // Замініть на власний URL фото
  
    countDocumentsById(callbackQuery.from.id).then(count => {
      getUser(callbackQuery.from.id).then(user => {
        console.log(user);
        var _reminder = ``
        
        if(user == null)
        {
          _reminder = `Виключено`
          setReminder(callbackQuery.from.id, false)
        }
        else if(typeof user.reminder == `undefined`)
        {
          _reminder = `Виключено`
          setReminder(callbackQuery.from.id, false)
        }
        else if(user.reminder == true)
        {
          _reminder = `Включено`
        }
        else if(user.reminder == false) {
          _reminder = `Виключено`
        }
        else {
          _reminder = `Виключено`
          setReminder(callbackQuery.from.id, false)
        }
        var name = ``
        if(firstName)
        {
          name = `${firstName}`
          if(lastName)
          {
            name = `${firstName} ${lastName}`
          }

        }
        var mesg = `${emodji.one} Ваше ім'я: ${name}\n` +
          `${emodji.two} Кількість списків: ${count}\n`+
          `${emodji.three} Нагадування: ${_reminder}`;
  
        const keyboard = {
          inline_keyboard: [
            [
              { text: `${emodji.back} Повернутись назад`, callback_data: 'menu' }
            ]
          ],
        };
  
        const options = {
          chat_id: message.chat.id,
          message_id: message.message_id,
          reply_markup: keyboard,
          parse_mode: 'Markdown',
        };
  
        bot.editMessageMedia({ type: 'photo', media: photoUrl, caption: mesg, parse_mode: 'Markdown' }, options);
      });
    });
  }
  
  async function findPublicDocuments() {
    try {
      const database = client.db("test");
      const collection = database.collection("lists");
  
      const query = { public: true };
      const result = await collection.find(query).toArray();
      console.log(result);
      const totalDocuments = await collection.countDocuments(query);
      console.log(`result.length: ${result.length}`);
      console.log(`totalDocuments: ${totalDocuments}`);
      var keyboard = []
      
      if(totalDocuments>=5)
      {
        var randomIndexes = getRandomIndexes(totalDocuments, 5);
        for(i = 0;i<5;i++)
        {
          keyboard.push([{text: result[randomIndexes[i]].name_list, callback_data: `open_shared_list:${result[randomIndexes[i]]._id}`}])
        }
      }
      else if(totalDocuments <=4)
      {
        for(i = 0;i<totalDocuments;i++)
        {
          keyboard.push([{text: result[i].name_list, callback_data: `open_shared_list:${result[i]._id}`}])
        }
      }
      console.log(`randomIndexes: ${randomIndexes}`);
      console.log(keyboard);
      return keyboard;
  
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }
  
  
  
  function open_shared_lists(callbackQuery) {
    const photoUrl = links.shared_list;
    findPublicDocuments().then(keyboard1 => {
      keyboard1.push([{text:  `${emodji.back} Повернутись назад`,  callback_data: 'lists'}])
      const replyMarkup = {
        inline_keyboard: keyboard1
      };
  
      bot.editMessageMedia(
        { type: 'photo', media: photoUrl },
        {
          chat_id: callbackQuery.message.chat.id,
          message_id: callbackQuery.message.message_id,
          reply_markup: replyMarkup
        }
      ).catch(error => {
        console.error('Error:', error);
      });
    }).catch(error => {
      console.error('Error:', error);
    });
  }
  
  // Функція для генерації випадкових індексів
  function getRandomIndexes(total, count) {
    const indexes = new Set();
    while (indexes.size < count) {
      const randomIndex = Math.floor(Math.random() * total);
      indexes.add(randomIndex);
    }
    return Array.from(indexes);
  }
function say(chatId,text_,){
  if(text_ == 0){
    text_ = responce_answer.not_auth_login;
  } else if(text_ == 1){
    text_ = responce_answer.not_auth_password;
  }
  else{
    text_ = text_;
  }
  const photoUrl = links.auth;
  const options = {
     caption: text_,
     parse_mode: "HTML"
    };
    bot.sendPhoto(chatId, photoUrl, options);
}
module.exports = {
  say, profile, addUser, getUser, setAuthUser, logOut, settings, menu, reminder, on_reminder, off_reminder, 
    getProd, lists, list_names, getLists, openList, openShareListbykeys_for_admins,openListbykeys,share_list, share_list_confirm,
    lists_out, addList, getSectionNames, delete_list, edit_list,updateDocumentsWithWaitingName,
    createInlineKeyboardForProducts, confirm_menu, add_product,updateDocumentsWithWaitingNameToNull,
    createInlineKeyboardForSections, open_section,add_element_to_list, password,login, name_change_waiting,
    name_change_update,findPublicDocuments,open_shared_lists,openShareListbykeys_for_user
  };