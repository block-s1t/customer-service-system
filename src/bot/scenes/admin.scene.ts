import { Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import {
  ADMIN_SCENE,
  AddAdminErrorReplyStr,
  COMMANDS,
  RemoveAdminErrorReplyStr,
} from '../../app.constants';
import { ToolService } from 'src/common/utils/tool.service';
import { BotService } from '../services/bot.service';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { ResponseTimeInterceptor } from 'src/common/interceptors/response-time.interceptor';
import { TelegrafExceptionFilter } from 'src/common/filters/telegraf-exception.filter';

@Scene(ADMIN_SCENE)
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class AdminScene {
  constructor(
    private toolService: ToolService,
    private botService: BotService,
  ) {}

  @SceneEnter()
  async onSceneEnter(ctx: any) {
    const { isRoot, isAdmin } = await this.botService.isAdminRoot(ctx.from.id);
    if (!isRoot && !isAdmin) {
      await this.botService.forwardToCustomerService(ctx);
      return;
    } else if (isAdmin && !isRoot) {
      await ctx.reply('🚫您不是超级管理员，无法访问此面板。');
      return;
    }

    //获取命令
    const command = this.toolService.getCommand(ctx.message.text);

    switch (command) {
      case COMMANDS.ADD_ADMIN:
        await this.onAddAdminCommand(ctx);
        break;
      case COMMANDS.REMOVE_ADMIN:
        await this.onRemoveAdminCommand(ctx);
        break;
      case COMMANDS.ADMIN_LIST:
        await this.onAdminlistCommand(ctx);
        break;
      default:
        break;
    }
  }

  async onAddAdminCommand(@Ctx() ctx: any): Promise<void> {
    let telegramId = this.toolService.getCommandParams(ctx.message.text);
    if (
      ctx.update.message.reply_to_message &&
      ctx.update.message.text === `/${COMMANDS.ADD_ADMIN}`
    ) {
      telegramId = this.toolService.getTelegramIdFromForwardedMessage(
        ctx.update.message.reply_to_message.text,
      );
    } else if (!telegramId) {
      await ctx.reply(AddAdminErrorReplyStr);
      return;
    }
    await this.botService.addAdmin(Number(telegramId), ctx);
  }

  async onRemoveAdminCommand(@Ctx() ctx: any): Promise<void> {
    let telegramId = this.toolService.getCommandParams(ctx.message.text);
    if (
      ctx.update.message.reply_to_message &&
      ctx.update.message.text === `/${COMMANDS.REMOVE_ADMIN}`
    ) {
      telegramId = this.toolService.getTelegramIdFromForwardedMessage(
        ctx.update.message.reply_to_message.text,
      );
    } else if (!telegramId) {
      await ctx.reply(RemoveAdminErrorReplyStr);
      return;
    }
    await this.botService.deleteAdmin(Number(telegramId), ctx);
  }

  async onAdminlistCommand(@Ctx() ctx: any): Promise<void> {
    await this.botService.getAdmins(ctx);
  }
}
