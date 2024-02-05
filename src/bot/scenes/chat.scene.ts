import { Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { CHAT_SCENE, COMMANDS } from '../../app.constants';
import { ToolService } from 'src/common/utils/tool.service';
import { BotService } from '../services/bot.service';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { ResponseTimeInterceptor } from 'src/common/interceptors/response-time.interceptor';
import { TelegrafExceptionFilter } from 'src/common/filters/telegraf-exception.filter';

@Scene(CHAT_SCENE)
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class ChatScene {
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
      case COMMANDS.CHAT:
        await this.onChatCommand(ctx);
        break;
      case COMMANDS.UNCHAT:
        await this.onUnchatCommand(ctx);
        break;
      default:
        break;
    }
  }

  async onChatCommand(@Ctx() ctx: any): Promise<void> {
    let telegramId = this.toolService.getCommandParams(ctx.message.text);
    await this.botService.updateReplyToUser(Number(telegramId), ctx);
  }

  async onUnchatCommand(@Ctx() ctx: any): Promise<void> {
    const telegramId = this.toolService.getCommandParams(ctx.message.text);
    await this.botService.cancelReplyToUser(Number(telegramId), ctx);
  }
}
