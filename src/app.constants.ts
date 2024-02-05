export const START_SCENE = 'START_SCENE';
export const BAN_SCENE = 'BAN_SCENE';
export const CHAT_SCENE = 'CHAT_SCENE';
export const SETTINGS_SCENE = 'SETTINGS_SCENE';
export const RECEIVING_SCENE = 'RECEIVING_SCENE';
export const POST_SCENE = 'POST_SCENE';
export const DATA_SCENE = 'DATA_SCENE';
export const ADMIN_SCENE = 'ADMIN_SCENE';

export const BotName = 'customer-service';

export const BanReplyStr = `🚫您已被封禁使用，您将无法再使用该机器人。'`;
export const ChatErrorReplyStr = `❌打开的方式不对

💠开始指定回复
/chat ID（指定回复某个用户ID）
/chat（回复用户的消息）

ID
您要与之指定回复的用户的ID`;

export const BanErrorReplyStr = `❌打开的方式不对

💠开始指定回复
/ban ID（指定回复某个用户ID）
/ban（回复用户的消息）

ID
您要与之指定回复的用户的ID`;

export const UnBanErrorReplyStr = `❌打开的方式不对

💠开始指定回复
/unban ID（指定回复某个用户ID）
/unban（回复用户的消息）

ID
您要与之指定回复的用户的ID`;

export const AddAdminErrorReplyStr = `❌打开的方式不对

💠开始指定回复
/addadmin ID（指定回复某个用户ID）
/addadmin（回复用户的消息）

ID
您要与之指定回复的用户的ID`;

export const RemoveAdminErrorReplyStr = `❌打开的方式不对

💠开始指定回复
/removeadmin ID（指定回复某个用户ID）
/removeadmin（回复用户的消息）

ID
您要与之指定回复的用户的ID`;

export const COMMANDS = {
  START: 'start',
  SETTINGS: 'settings',
  BAN: 'ban',
  UNBAN: 'unban',
  LIST_BAN: 'listban',
  ADD_ADMIN: 'addadmin',
  REMOVE_ADMIN: 'removeadmin',
  ADMIN_LIST: 'adminlist',
  CHAT: 'chat',
  UNCHAT: 'unchat',
  POST: 'post',
  HEARS:
    /^(?!\/start|\/settings|\/ban|\/unban|\/listban|\/addadmin|\/removeadmin|\/adminlist|\/chat|\/unchat|\/post).+/,
};

export const ACTION = {
  MANAGE: 'manage',
  BACK: 'back',
  BLACK_LIST: 'blacklist',
  REPLY: 'reply',
  EDIT: 'edit',
  BROADCAST: 'broadcast',
};

export const ON = {
  MESSAGE: 'message',
  EDITED_MESSAGE: 'edited_message',
};

export const SettingInlineKeyboard = [
  [
    {
      text: '👷‍♀️管理权限',
      callback_data: 'manage',
    },
    {
      text: '📛黑名单',
      callback_data: 'blacklist',
    },
  ],
  [
    {
      text: '💭指定回复',
      callback_data: 'reply',
    },
    {
      text: '✏️ 编辑消息',
      callback_data: 'edit',
    },
  ],
  [
    {
      text: '↩️群发消息',
      callback_data: 'broadcast',
    },
  ],
];

export const BackInlineKeyboard = [
  [
    {
      text: '返回',
      callback_data: 'back',
    },
  ],
];

export const ACTION_TEXT = {
  MANAGE: `👷 管理授权
    \n➥ 添加多名管理员，共同处理客户诉求。
    \n💠 添加管理员\n命令: /addadmin ID\n或用 /addadmin 回复用户消息 。
    \n💠 删除管理员\n命令: /removeadmin ID\n或用 /removeadmin 回复需删除的管理员的消息。
    \n💠 查看管理员列表\n/adminlist`,
  BACK: `👷管理面板\n\n在此处访问设置和信息以管理本机器人。`,
  BLACK_LIST: `📛 屏蔽列表
    \n➥ 从这个菜单你可以管理封禁名单，被封禁的用户无法使用本机器人。
    \n💠 封禁\n/ban  ID\n或用 /ban 回复用户消息。
    \n💠 解封\n/unban ID\n或用 /unban 回复待解封用户消息。
    \n💠 查看封禁列表\n/listban`,
  REPLY: `💭 聊天模式
    \n➥ 直接将信息发送给指定用户( 不需要用回复的方式 )。该功能期间，无法向其他用户发送消息。
    \n💠 开始聊天模式\n/chat ID \n或用/chat回复对方信息
    \n💠 退出聊天模式\n/unchat`,
  EDIT: `✏️ 编辑消息
    \n➥ 72 小时内无痕编辑消息。`,
  BROADCAST: `💠向每个用户发送消息
    \n➥ /post 消息内容`,
};
