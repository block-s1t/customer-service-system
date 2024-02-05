import { Scene, SceneEnter } from 'nestjs-telegraf';
import { POST_SCENE } from '../../app.constants';
import { ToolService } from 'src/common/utils/tool.service';
import { BotService } from '../services/bot.service';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { ResponseTimeInterceptor } from 'src/common/interceptors/response-time.interceptor';
import { TelegrafExceptionFilter } from 'src/common/filters/telegraf-exception.filter';

@Scene(POST_SCENE)
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class PostScene {
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

    const message = this.toolService.getPostContent(ctx.message.text);
    await this.botService.broadcastMessage(message, ctx);
  }
}
