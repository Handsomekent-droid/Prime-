const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Load config and database
const config = require('./config.json');
let db = JSON.parse(fs.readFileSync('users.json'));

// Initialize bot
const bot = new TelegramBot(config.token, { polling: true });

// Save DB function
function saveDb() {
  fs.writeFileSync('users.json', JSON.stringify(db, null, 2));
}

// Bot name
const BOT_NAME = '꙰⚔️𝗣𝗥𝗜𝗠𝗘⿻☙𝗞𝗜𝗟𝗟𝗘𝗥 ꙰⿻🕷️𝗠𝗗 ꙰';

// Full menu inline keyboard
const FULL_MENU = {
  reply_markup: {
    inline_keyboard: [
      // User commands
      [{ text: "/add", callback_data: "cmd_add" }, { text: "/myid", callback_data: "cmd_myid" }],
      [{ text: "/delid", callback_data: "cmd_delid" }, { text: "/mynum", callback_data: "cmd_mynum" }],
      [{ text: "/delnum", callback_data: "cmd_delnum" }],

      // Owner commands (only you can use)
      [{ text: "/ban", callback_data: "cmd_ban" }, { text: "/unban", callback_data: "cmd_unban" }],
      [{ text: "/listban", callback_data: "cmd_listban" }, { text: "/addowner", callback_data: "cmd_addowner" }],

      // Groups / Links
      [{ text: "🛡️ Support Group", url: "https://t.me/primekillercrasherv1" }],
      [{ text: "📢 Channel", url: "https://t.me/primekillercrasher" }],
      [{ text: "👑 Developer", url: "https://t.me/Handsome_primis_killer_kent" }]
    ]
  }
};

// --- /start command ---
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `👑 Welcome to ${BOT_NAME}!\nUse the buttons below to access commands or links.`, FULL_MENU);
});

// --- /add command ---
bot.onText(/\/add (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const number = match[1];

  if (db.approved.includes(number)) {
    bot.sendMessage(chatId, `✅ Already approved!`, FULL_MENU);
  } else if (db.pending.includes(number)) {
    bot.sendMessage(chatId, `⏳ Your request is already pending.`, FULL_MENU);
  } else {
    db.pending.push(number);
    saveDb();
    bot.sendMessage(chatId, `📨 Request sent for approval!`, FULL_MENU);
    bot.sendMessage(config.groupId, `🔔 New number request from ${msg.from.first_name} (${chatId}) in ${BOT_NAME}:\nNumber: ${number}\nApprove with /approve ${number}`);
  }
});

// --- /approve command (owner only) ---
bot.onText(/\/approve (.+)/, (msg, match) => {
  if (msg.from.id !== config.owner) return;

  const number = match[1];
  const index = db.pending.indexOf(number);
  if (index === -1) return;

  db.pending.splice(index, 1);
  db.approved.push(number);
  saveDb();

  bot.sendMessage(config.owner, `✅ Number ${number} approved in ${BOT_NAME}!`, FULL_MENU);
  bot.sendMessage(number, `🎉 Your number is approved! You can now use ${BOT_NAME}.`, FULL_MENU);
});

// --- Block unapproved users ---
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (!db.approved.includes(String(chatId)) && !msg.text.startsWith('/add') && !msg.text.startsWith('/start')) {
    bot.sendMessage(chatId, `❌ You are not approved yet. Use /add <your number> to request access to ${BOT_NAME}.`, FULL_MENU);
  }
});

// --- Handle button callbacks ---
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;

  // Only owner commands check
  const isOwner = callbackQuery.from.id === config.owner;

  switch(data){
    case "cmd_add":
      bot.sendMessage(msg.chat.id, "Use /add <your number> to request access.", FULL_MENU);
      break;
    case "cmd_myid":
      bot.sendMessage(msg.chat.id, `Your ID: ${msg.chat.id}`, FULL_MENU);
      break;
    case "cmd_delid":
      if(isOwner) bot.sendMessage(msg.chat.id, "Use /delid <ID> to remove a user.", FULL_MENU);
      else bot.sendMessage(msg.chat.id, "❌ Only owner can use this command.", FULL_MENU);
      break;
    case "cmd_mynum":
      bot.sendMessage(msg.chat.id, "Use /mynum to see your number.", FULL_MENU);
      break;
    case "cmd_delnum":
      if(isOwner) bot.sendMessage(msg.chat.id, "Use /delnum <number> to remove a number.", FULL_MENU);
      else bot.sendMessage(msg.chat.id, "❌ Only owner can use this command.", FULL_MENU);
      break;
    case "cmd_ban":
      if(isOwner) bot.sendMessage(msg.chat.id, "Use /ban <ID> to ban a user.", FULL_MENU);
      else bot.sendMessage(msg.chat.id, "❌ Only owner can use this command.", FULL_MENU);
      break;
    case "cmd_unban":
      if(isOwner) bot.sendMessage(msg.chat.id, "Use /unban <ID> to unban a user.", FULL_MENU);
      else bot.sendMessage(msg.chat.id, "❌ Only owner can use this command.", FULL_MENU);
      break;
    case "cmd_listban":
      if(isOwner) bot.sendMessage(msg.chat.id, "Shows list of banned users.", FULL_MENU);
      else bot.sendMessage(msg.chat.id, "❌ Only owner can use this command.", FULL_MENU);
      break;
    case "cmd_addowner":
      if(isOwner) bot.sendMessage(msg.chat.id, "Use /addowner <ID> to add a new owner.", FULL_MENU);
      else bot.sendMessage(msg.chat.id, "❌ Only owner can use this command.", FULL_MENU);
      break;
  }
});
