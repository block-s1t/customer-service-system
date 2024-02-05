import { Scene, SceneEnter } from 'nestjs-telegraf';
import { START_SCENE } from '../../app.constants';
import { Context } from '../../common/interfaces/context.interface';
import { ToolService } from 'src/common/utils/tool.service';
import { BotService } from '../services/bot.service';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { ResponseTimeInterceptor } from 'src/common/interceptors/response-time.interceptor';
import { TelegrafExceptionFilter } from 'src/common/filters/telegraf-exception.filter';

@Scene(START_SCENE)
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class StartScene {
  constructor(
    private toolService: ToolService,
    private botService: BotService,
  ) {}

  @SceneEnter()
  async onSceneEnter(ctx: Context) {
    if (await this.botService.isAdmin(ctx.from.id)) {
      await ctx.reply(
        `👋 欢迎使用本机器人！    \n
      \n➥ 发送 /settings 打开设置面板`,
      );
      return;
    }
    await this.botService.upsertUser(ctx.from.id, ctx.from.username);
    await ctx.reply(`👋 欢迎使用客服机器人！`);
  }
}
