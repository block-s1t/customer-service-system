import { Action, Scene, SceneEnter } from 'nestjs-telegraf';
import {
  ACTION,
  ACTION_TEXT,
  BackInlineKeyboard,
  SETTINGS_SCENE,
  SettingInlineKeyboard,
} from '../../app.constants';
import { Context } from '../../common/interfaces/context.interface';
import { ToolService } from 'src/common/utils/tool.service';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { BotService } from '../services/bot.service';
import { ResponseTimeInterceptor } from 'src/common/interceptors/response-time.interceptor';
import { TelegrafExceptionFilter } from 'src/common/filters/telegraf-exception.filter';

@Scene(SETTINGS_SCENE)
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class SettingsScene {
  constructor(
    private toolService: ToolService,
    private botService: BotService,
  ) {}

  @SceneEnter()
  async onSceneEnter(ctx: Context) {
    const { isRoot, isAdmin } = await this.botService.isAdminRoot(ctx.from.id);
    if (!isRoot && !isAdmin) {
      await this.botService.forwardToCustomerService(ctx);
      return;
    } else if (isAdmin && !isRoot) {
      await ctx.reply('🚫您不是超级管理员，无法访问此面板。');
      return;
    }

    this.mangeMessage(ctx);
  }

  //发送管理面板消息
  mangeMessage(ctx: Context) {
    ctx.sendMessage(
      {
        text: `👷管理面板\n\n在此处访问设置和信息以管理本机器人。`,
      },
      {
        reply_markup: {
          inline_keyboard: SettingInlineKeyboard,
        },
      },
    );
  }

  @Action(ACTION.MANAGE)
  async handleManage(ctx: Context) {
    ctx.editMessageText(
      {
        text: ACTION_TEXT.MANAGE,
      },
      {
        reply_markup: {
          inline_keyboard: BackInlineKeyboard,
        },
      },
    );
  }

  @Action(ACTION.BACK)
  async handleBack(ctx: Context) {
    ctx.editMessageText(
      {
        text: ACTION_TEXT.BACK,
      },
      {
        reply_markup: {
          inline_keyboard: SettingInlineKeyboard,
        },
      },
    );
  }

  @Action(ACTION.BLACK_LIST)
  async handleBlacklist(ctx: Context) {
    ctx.editMessageText(
      {
        text: ACTION_TEXT.BLACK_LIST,
      },
      {
        reply_markup: {
          inline_keyboard: BackInlineKeyboard,
        },
      },
    );
  }

  @Action(ACTION.REPLY)
  async handleReply(ctx: Context) {
    ctx.editMessageText(
      {
        text: ACTION_TEXT.REPLY,
      },
      {
        reply_markup: {
          inline_keyboard: BackInlineKeyboard,
        },
      },
    );
  }

  @Action(ACTION.EDIT)
  async handleEdit(ctx: Context) {
    ctx.editMessageText(
      {
        text: ACTION_TEXT.EDIT,
      },
      {
        reply_markup: {
          inline_keyboard: BackInlineKeyboard,
        },
      },
    );
  }

  @Action(ACTION.BROADCAST)
  async handleBroadcast(ctx: Context) {
    ctx.editMessageText(
      {
        text: ACTION_TEXT.BROADCAST,
      },
      {
        reply_markup: {
          inline_keyboard: BackInlineKeyboard,
        },
      },
    );
  }
}
