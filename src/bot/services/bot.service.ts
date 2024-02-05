import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ToolService } from 'src/common/utils/tool.service';
import { TelegrafException } from 'nestjs-telegraf';
import { ChatErrorReplyStr } from 'src/app.constants';

@Injectable()
export class BotService {
  constructor(
    private prismaService: PrismaService,
    private toolService: ToolService,
  ) {}

  //判断用户是否存在
  async isUserExist(telegramId: number): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: {
        telegramId,
      },
    });

    console.log(`-------------------${telegramId}`);
    console.log(user);

    return user !== null && user !== undefined;
  }

  //如果用户不存在，则创建用户，如果存在，则更新用户
  async upsertUser(telegramId: number, name: string) {
    return await this.prismaService.user.upsert({
      where: {
        telegramId,
      },
      update: {
        name,
      },
      create: {
        telegramId,
        name,
        isAdmin: false,
      },
    });
  }

  //添加管理员
  async addAdmin(telegramId: number, ctx: any) {
    //查询用户是否存在，如果不存在则创建用户
    const user = await this.prismaService.user.findUnique({
      where: {
        telegramId,
      },
    });

    if (!user) {
      throw new TelegrafException(
        `🚫[${telegramId}]用户不存在, 请输入正确的用户ID!`,
      );
    }

    await this.prismaService.user.update({
      where: {
        telegramId,
      },
      data: {
        isAdmin: true,
      },
    });

    await ctx.reply(`✅${user.name} [${user.telegramId}]添加为管理员`);

    //发送消息给用户
    await ctx.telegram.sendMessage(
      Number(telegramId),
      `✅您现在是机器人的管理员！`,
    );
  }

  //删除管理员
  async deleteAdmin(telegramId: number, ctx: any) {
    //查询用户是否存在，如果不存在则输出错误信息
    const user = await this.prismaService.user.findUnique({
      where: {
        telegramId,
      },
    });

    if (!user) {
      throw new TelegrafException(
        `🚫[${telegramId}]管理员不存在, 请输入正确的管理员ID!`,
      );
    }

    await this.prismaService.user.update({
      where: {
        telegramId,
      },
      data: {
        isAdmin: false,
      },
    });

    await ctx.reply(
      `✅${user.name} [${user.telegramId}]已从管理员列表中删除。`,
    );

    //发送消息给用户
    await ctx.telegram.sendMessage(
      Number(telegramId),
      `🚫 已移除您的管理员身份！`,
    );
  }

  //查询用户是否为管理员
  async isAdmin(telegramId: number): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: {
        telegramId,
      },
    });

    if (!user) return false;

    return user.isAdmin;
  }

  //查询用户返回管理员身份
  async isAdminRoot(telegramId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        telegramId,
        isAdmin: true,
      },
    });

    return { isAdmin: user.isAdmin, isRoot: user.isRoot };
  }

  //获取所有管理员, 用于发送给管理员
  async getAdmins(ctx: any) {
    const users = await this.prismaService.user.findMany({
      where: {
        isAdmin: true,
      },
    });

    let usersInfo = '';

    users.forEach(async (user) => {
      usersInfo = usersInfo + `✅ [${user.telegramId}] ${user.name}\n`;
    });

    await ctx.reply(`👷管理员列表：\n\n${usersInfo}`);
  }

  //获取所有管理员的telegramId
  async getAdminIds(): Promise<number[]> {
    const users = await this.prismaService.user.findMany({
      where: {
        isAdmin: true,
        isBlocked: false,
      },
    });

    return users.map((user) => Number(user.telegramId));
  }

  //管理员回复用户消息
  async adminReplyToUser(ctx: any) {
    if (ctx.message.poll || ctx.message.location) {
      await ctx.reply(`❗️不支持该类型。`);
      return;
    }

    //判断是否指定回复用户
    if (await this.isReplyToUser(ctx.message.from.id)) {
      const user = await this.prismaService.user.findUnique({
        where: {
          telegramId: ctx.message.from.id,
        },
      });

      const updateMessage = await this.getAdminReplyMessage(
        Number(user.specifiedTelegramId),
        ctx,
      );

      // 更新映射关系
      await this.prismaService.messageMap.create({
        data: {
          adminMessageId: ctx.message.message_id,
          userChatId: Number(user.specifiedTelegramId),
          userMessageId: updateMessage.message_id,
        },
      });

      await this.adminBroadcastMessage(
        user.specifiedTelegramId.toString(),
        ctx,
      );

      return;
    }

    //判断reply_to_message是否存在
    if (!ctx.message.reply_to_message) {
      await ctx.telegram.sendMessage(
        ctx.message.from.id,
        `❗️您必须回复您要回复的用户的消息。`,
      );
      return;
    }

    const replyToMessageTgId =
      this.toolService.getTelegramIdFromForwardedMessage(
        ctx.message.reply_to_message.text,
      );

    // 发送回复给用户
    const updateMessage = await this.getAdminReplyMessage(
      Number(replyToMessageTgId),
      ctx,
    );

    // 更新映射关系
    await this.prismaService.messageMap.create({
      data: {
        adminMessageId: ctx.message.message_id,
        userChatId: Number(replyToMessageTgId),
        userMessageId: updateMessage.message_id,
      },
    });

    await this.adminBroadcastMessage(replyToMessageTgId, ctx);
  }

  //获取管理员回复的消息
  async getAdminReplyMessage(replyToMessageTgId: number, ctx: any) {
    //如果回复为图片，则发送图片,如果为视频，则发送视频，如果为文件，则发送文件，其他则发送文本
    if (ctx.message.photo) {
      const photo = ctx.message.photo[ctx.message.photo.length - 1];

      return await ctx.telegram.sendPhoto(
        replyToMessageTgId,
        photo.file_id,
        ctx.message.caption ? { caption: ctx.message.caption } : {},
      );
    } else if (ctx.message.video) {
      const video = ctx.message.video;

      return await ctx.telegram.sendVideo(
        replyToMessageTgId,
        video.file_id,
        video.caption ? { caption: video.caption } : {},
      );
    } else if (ctx.message.document) {
      const document = ctx.message.document;

      return await ctx.telegram.sendDocument(
        replyToMessageTgId,
        document.file_id,
        document.caption ? { caption: document.caption } : {},
      );
    } else if (ctx.message.audio) {
      const audio = ctx.message.audio;

      return await ctx.telegram.sendAudio(
        replyToMessageTgId,
        audio.file_id,
        audio.caption ? { caption: audio.caption } : {},
      );
    } else if (ctx.message.sticker) {
      const sticker = ctx.message.sticker;

      return await ctx.telegram.sendSticker(
        replyToMessageTgId,
        sticker.file_id,
        sticker.caption ? { caption: sticker.caption } : {},
      );
    } else if (ctx.message.animation) {
      const animation = ctx.message.animation;

      return await ctx.telegram.sendAnimation(
        replyToMessageTgId,
        animation.file_id,
        animation.caption ? { caption: animation.caption } : {},
      );
    } else if (ctx.message.voice) {
      const voice = ctx.message.voice;

      return await ctx.telegram.sendVoice(
        replyToMessageTgId,
        voice.file_id,
        voice.caption ? { caption: voice.caption } : {},
      );
    } else if (ctx.message.video_note) {
      const video_note = ctx.message.video_note;

      return await ctx.telegram.sendVideoNote(
        replyToMessageTgId,
        video_note.file_id,
        video_note.caption ? { caption: video_note.caption } : {},
      );
    } else if (ctx.message.contact) {
      const contact = ctx.message.contact;

      return await ctx.telegram.sendContact(
        replyToMessageTgId,
        contact.phone_number,
        contact.first_name,
        contact.last_name,
        contact.vcard,
      );
    } else if (ctx.message.venue) {
      const venue = ctx.message.venue;

      return await ctx.telegram.sendVenue(
        replyToMessageTgId,
        venue.latitude,
        venue.longitude,
        venue.title,
        venue.address,
        venue.foursquare_id,
        venue.foursquare_type,
      );
    } else if (ctx.message.location) {
      const location = ctx.message.location;

      return await ctx.telegram.sendLocation(
        replyToMessageTgId,
        location.latitude,
        location.longitude,
      );
    } else if (ctx.message.poll) {
      const poll = ctx.message.poll;

      return await ctx.telegram.sendPoll(
        replyToMessageTgId,
        poll.question,
        poll.options,
        poll.is_anonymous,
        poll.type,
        poll.allows_multiple_answers,
        poll.correct_option_id,
        poll.explanation,
        poll.explanation_entities,
        poll.open_period,
        poll.close_date,
        poll.is_closed,
      );
    } else {
      return await ctx.telegram.sendMessage(
        replyToMessageTgId,
        ctx.message.text,
      );
    }
  }

  async sendAdminEditMessage(
    userChatId: number,
    userMessageId: number,
    ctx: any,
  ) {
    //编辑图片消息
    if (ctx.update.edited_message.photo) {
      const photo = ctx.update.edited_message.photo[0];

      await ctx.telegram.editMessageMedia(userChatId, userMessageId, null, {
        type: 'photo',
        media: photo.file_id,
        caption: ctx.update.edited_message.caption ?? '',
      });

      return;
    }
    //编辑视频消息
    else if (ctx.update.edited_message.video) {
      const video = ctx.update.edited_message.video;

      await ctx.telegram.editMessageMedia(userChatId, userMessageId, null, {
        type: 'video',
        media: video.file_id,
        caption: ctx.update.edited_message.caption ?? '',
      });

      return;
    }
    //编辑文件消息
    else if (ctx.update.edited_message.document) {
      const document = ctx.update.edited_message.document;

      await ctx.telegram.editMessageMedia(userChatId, userMessageId, null, {
        type: 'document',
        media: document.file_id,
        caption: ctx.update.edited_message.caption ?? '',
      });

      return;
    }
    //编辑音频消息
    else if (ctx.update.edited_message.audio) {
      const audio = ctx.update.edited_message.audio;

      await ctx.telegram.editMessageMedia(userChatId, userMessageId, null, {
        type: 'audio',
        media: audio.file_id,
        caption: ctx.update.edited_message.caption ?? '',
      });

      return;
    }
    //编辑贴纸消息
    else if (ctx.update.edited_message.sticker) {
      const sticker = ctx.update.edited_message.sticker;

      await ctx.telegram.editMessageMedia(userChatId, userMessageId, null, {
        type: 'sticker',
        media: sticker.file_id,
      });

      return;
    }
    //编辑动画消息
    else if (ctx.update.edited_message.animation) {
      const animation = ctx.update.edited_message.animation;

      await ctx.telegram.editMessageMedia(userChatId, userMessageId, null, {
        type: 'animation',
        media: animation.file_id,
        caption: ctx.update.edited_message.caption ?? '',
      });

      return;
    }
    //编辑语音消息
    else if (ctx.update.edited_message.voice) {
      const voice = ctx.update.edited_message.voice;

      await ctx.telegram.editMessageMedia(userChatId, userMessageId, null, {
        type: 'voice',
        media: voice.file_id,
      });

      return;
    }
    //编辑视频笔记消息
    else if (ctx.update.edited_message.video_note) {
      const video_note = ctx.update.edited_message.video_note;

      await ctx.telegram.editMessageMedia(userChatId, userMessageId, null, {
        type: 'video_note',
        media: video_note.file_id,
      });

      return;
    } else {
      await ctx.telegram.editMessageText(
        userChatId,
        userMessageId,
        null,
        ctx.update.edited_message.text,
      );
    }
  }

  async adminEditReplyToUser(ctx: any) {
    //获取用户消息映射关系
    const messageMap = await this.prismaService.messageMap.findUnique({
      where: {
        adminMessageId: ctx.update.edited_message.message_id,
      },
    });

    await this.sendAdminEditMessage(
      Number(messageMap.userChatId),
      Number(messageMap.userMessageId),
      ctx,
    );

    await ctx.telegram.sendMessage(
      ctx.update.edited_message.from.id,
      `✅ 已编辑`,
    );
  }

  //对管理员群发
  async adminBroadcastMessage(replyToMessageTgId: string, ctx: any) {
    const getAdminIds = await this.getAdminIds();

    getAdminIds.forEach(async (telegramId) => {
      if (telegramId === ctx.message.from.id) return;

      await ctx.telegram.forwardMessage(
        telegramId,
        ctx.chat.id,
        ctx.message.message_id,
      );

      //对某条消息进行回复
      await ctx.telegram.sendMessage(
        telegramId,
        `👩🏻‍💻 ${ctx.update.message.from.username} [${ctx.update.message.from.id}] 回复 ${replyToMessageTgId} [${replyToMessageTgId}].`,
      );
    });
  }

  //用户转发消息给管理员
  async forwardToCustomerService(ctx: any) {
    const getAdminIds = await this.getAdminIds();

    getAdminIds.forEach(async (telegramId) => {
      const forwardedMessage = await ctx.telegram.forwardMessage(
        telegramId,
        ctx.chat.id,
        ctx.message.message_id,
      );

      //对某条消息进行回复
      await ctx.telegram.sendMessage(
        telegramId,
        `⬆️ ${ctx.from.id} 隐藏了他的帐户。\n回复此消息即可回复他。`,
        {
          reply_to_message_id: forwardedMessage.message_id,
        },
      );
    });
  }

  //拉黑某个用户
  async banUser(telegramId: number, ctx: any) {
    //查询用户是否存在，如果不存在则输出错误信息
    const user = await this.prismaService.user.findUnique({
      where: {
        telegramId,
      },
    });

    if (!user) {
      throw new TelegrafException(
        `🚫[${telegramId}]用户不存在, 请输入正确的用户ID!`,
      );
    }

    await this.prismaService.user.update({
      where: {
        telegramId,
      },
      data: {
        isBlocked: true,
      },
    });

    await ctx.reply(`🚫我已经封禁${user.name} [${user.telegramId}]`);
  }

  //解除拉黑某个用户
  async unbanUser(telegramId: number, ctx: any) {
    //查询用户是否存在，如果不存在则输出错误信息
    const user = await this.prismaService.user.findUnique({
      where: {
        telegramId,
      },
    });

    if (!user) {
      throw new TelegrafException(
        `🚫[${telegramId}]用户不存在, 请输入正确的用户ID!`,
      );
    }

    await this.prismaService.user.update({
      where: {
        telegramId,
      },
      data: {
        isBlocked: false,
      },
    });

    await ctx.reply(`✅${user.name} [${user.telegramId}]已解除封禁状态。`);

    //发送消息给用户
    await ctx.telegram.sendMessage(
      Number(user.telegramId),
      `✅您已被解除封禁！`,
    );
  }

  //判断用户是否被拉黑
  async isBanned(telegramId: number): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: {
        telegramId,
      },
    });

    if (!user) {
      throw new TelegrafException(
        `🚫[${telegramId}]用户不存在, 请输入正确的用户ID!`,
      );
    }

    return user.isBlocked;
  }

  //获取所有被拉黑的用户,不包括管理员, 用于发送给管理员
  async getBannedUsers(ctx: any) {
    const users = await this.prismaService.user.findMany({
      where: {
        isAdmin: false,
        isBlocked: true,
      },
    });

    let usersInfo = '';

    users.forEach(async (user) => {
      usersInfo = usersInfo + `❗️ [${user.telegramId}] ${user.name}\n`;
    });

    await ctx.reply(`🚫被封禁的用户列表：\n${usersInfo}`);
  }

  //更新回复指定用户
  async updateReplyToUser(specifiedTelegramId: number, ctx: any) {
    //查询用户是否存在，如果不存在则输出错误信息
    if (
      !ctx.update.message.reply_to_message &&
      !(await this.isUserExist(specifiedTelegramId))
    ) {
      await ctx.reply(ChatErrorReplyStr);
      return;
    }
    const replyToMessageTgId =
      this.toolService.getTelegramIdFromForwardedMessage(
        ctx.update.message.reply_to_message.text,
      );

    if (!(await this.isUserExist(Number(replyToMessageTgId)))) {
      await ctx.reply(ChatErrorReplyStr);
      return;
    }

    await this.prismaService.user.update({
      where: {
        telegramId: ctx.update.message.from.id,
      },
      data: {
        specifiedTelegramId: specifiedTelegramId
          ? specifiedTelegramId
          : Number(replyToMessageTgId),
      },
    });

    const user = await this.prismaService.user.findUnique({
      where: {
        telegramId: specifiedTelegramId
          ? specifiedTelegramId
          : Number(replyToMessageTgId),
      },
    });

    await ctx.reply(`✅当前正在指定回复${user.name} [${user.telegramId}]`);
  }

  //取消回复指定用户
  async cancelReplyToUser(specifiedTelegramId: number, ctx: any) {
    const adminUser = await this.prismaService.user.findUnique({
      where: {
        telegramId: ctx.update.message.from.id,
        isAdmin: true,
      },
    });

    if (!adminUser) {
      await ctx.reply(`🚫您的权限不足，无法取消指定回复！`);
      return;
    }

    await this.prismaService.user.update({
      where: {
        telegramId: ctx.update.message.from.id,
      },
      data: {
        specifiedTelegramId: null,
      },
    });

    await ctx.reply(`❌您已结束指定回复。`);
  }

  //判断管理员是否指定回复某个用户
  async isReplyToUser(telegramId: number): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: {
        telegramId,
      },
    });

    if (!user) {
      throw new TelegrafException(
        `🚫[${telegramId}]用户不存在, 请输入正确的用户ID!`,
      );
    }

    return user.specifiedTelegramId !== null;
  }

  //群发消息给所有用户
  async broadcastMessage(message: string, ctx: any) {
    if (message === null || message === undefined || message.length === 0) {
      await ctx.reply(`❗️您必须输入要发送的消息。`);
      return;
    }

    const users = await this.prismaService.user.findMany({
      where: {
        isAdmin: false,
        isBlocked: false,
      },
    });

    users.forEach(async (user) => {
      await ctx.telegram.sendMessage(Number(user.telegramId), message);
    });

    await ctx.reply(`✅消息已发送给所有用户。`);

    const getAdminIds = await this.getAdminIds();

    getAdminIds.forEach(async (telegramId) => {
      console.log(telegramId);

      if (telegramId === ctx.message.from.id) return;

      //对群发进行提醒
      await ctx.telegram.sendMessage(
        Number(telegramId),
        `👩🏻‍💻 ${ctx.update.message.from.username} [${ctx.update.message.from.id}] 对所有用户进行群发，群发内容\n[${message}] `,
      );
    });
  }
}
