import { Scene, SceneEnter } from 'nestjs-telegraf';
import { BanReplyStr, DATA_SCENE } from '../../app.constants';
import { BotService } from '../services/bot.service';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { ResponseTimeInterceptor } from 'src/common/interceptors/response-time.interceptor';
import { TelegrafExceptionFilter } from 'src/common/filters/telegraf-exception.filter';

@Scene(DATA_SCENE)
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class DataScene {
  constructor(private botService: BotService) {}

  @SceneEnter()
  async onSceneEnter(ctx: any) {
    const telegramId = ctx.update.edited_message
      ? ctx.update.edited_message.from.id
      : ctx.update.message.from.id;
    if (await this.botService.isAdmin(telegramId)) {
      ctx.update.edited_message
        ? await this.botService.adminEditReplyToUser(ctx)
        : await this.botService.adminReplyToUser(ctx);
      return;
    }

    if (await this.botService.isBanned(telegramId)) {
      await ctx.reply(BanReplyStr);
      return;
    }

    await this.botService.forwardToCustomerService(ctx);
  }
}
