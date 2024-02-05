import { Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import {
  BAN_SCENE,
  BanErrorReplyStr,
  COMMANDS,
  UnBanErrorReplyStr,
} from '../../app.constants';
import { ToolService } from 'src/common/utils/tool.service';
import { BotService } from '../services/bot.service';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { ResponseTimeInterceptor } from 'src/common/interceptors/response-time.interceptor';
import { TelegrafExceptionFilter } from 'src/common/filters/telegraf-exception.filter';

@Scene(BAN_SCENE)
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class BanScene {
  constructor(
    private toolService: ToolService,
    private botService: BotService,
  ) {}

  @SceneEnter()
  async onSceneEnter(ctx: any) {
    if (!(await this.botService.isAdmin(ctx.from.id))) {
      await this.botService.forwardToCustomerService(ctx);
      return;
    }

    //获取命令
    const command = this.toolService.getCommand(ctx.message.text);

    switch (command) {
      case COMMANDS.BAN:
        await this.onBanCommand(ctx);
        break;
      case COMMANDS.UNBAN:
        await this.onUnbanCommand(ctx);
        break;
      case COMMANDS.LIST_BAN:
        await this.onListBanCommand(ctx);
        break;
      default:
        break;
    }
  }

  async onBanCommand(@Ctx() ctx: any): Promise<void> {
    let telegramId = this.toolService.getCommandParams(ctx.message.text);
    if (
      ctx.update.message.reply_to_message &&
      ctx.update.message.text === `/${COMMANDS.BAN}`
    ) {
      telegramId = this.toolService.getTelegramIdFromForwardedMessage(
        ctx.update.message.reply_to_message.text,
      );
    } else if (!telegramId) {
      await ctx.reply(BanErrorReplyStr);
      return;
    }
    await this.botService.banUser(Number(telegramId), ctx);
  }

  async onUnbanCommand(@Ctx() ctx: any): Promise<void> {
    let telegramId = this.toolService.getCommandParams(ctx.message.text);
    if (
      ctx.update.message.reply_to_message &&
      ctx.update.message.text === `/${COMMANDS.UNBAN}`
    ) {
      telegramId = this.toolService.getTelegramIdFromForwardedMessage(
        ctx.update.message.reply_to_message.text,
      );
    } else if (!telegramId) {
      await ctx.reply(UnBanErrorReplyStr);
      return;
    }
    await this.botService.unbanUser(Number(telegramId), ctx);
  }

  //获取封禁列表
  async onListBanCommand(@Ctx() ctx: any): Promise<void> {
    await this.botService.getBannedUsers(ctx);
  }
}
