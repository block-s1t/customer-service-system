import { Scene, SceneEnter } from 'nestjs-telegraf';
import { BanReplyStr, RECEIVING_SCENE } from '../../app.constants';
import { ToolService } from 'src/common/utils/tool.service';
import { BotService } from '../services/bot.service';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { ResponseTimeInterceptor } from 'src/common/interceptors/response-time.interceptor';
import { TelegrafExceptionFilter } from 'src/common/filters/telegraf-exception.filter';

@Scene(RECEIVING_SCENE)
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class ReceivingScene {
  constructor(
    private toolService: ToolService,
    private botService: BotService,
  ) {}

  @SceneEnter()
  async onSceneEnter(ctx: any) {
    console.log(ctx.updage);
    if (!(await this.botService.isUserExist(ctx.from.id))) {
      await this.botService.upsertUser(ctx.from.id, ctx.from.username);
      await ctx.reply(`👋 欢迎使用客服机器人！`);
    }

    if (await this.botService.isAdmin(ctx.from.id)) {
      await this.botService.adminReplyToUser(ctx);
      return;
    }

    if (await this.botService.isBanned(ctx.from.id)) {
      await ctx.reply(BanReplyStr);
      return;
    }

    await this.botService.forwardToCustomerService(ctx);
  }
}
