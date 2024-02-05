import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';
import { ToolService } from '../utils/tool.service';
import { BotService } from 'src/bot/services/bot.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private toolService: ToolService,
    private botService: BotService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = TelegrafExecutionContext.create(context);
    const { from } = ctx.getContext<Context>();

    if (!(await this.botService.isAdmin(from.id))) {
      console.log('not admin');
      await this.botService.forwardToCustomerService(ctx);
      return false;
    }

    return true;
  }
}
