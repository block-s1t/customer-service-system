import { Command, Ctx, Hears, On, Update } from 'nestjs-telegraf';
import { Context as IContext } from '../common/interfaces/context.interface';
import {
  ADMIN_SCENE,
  BAN_SCENE,
  CHAT_SCENE,
  COMMANDS,
  DATA_SCENE,
  POST_SCENE,
  RECEIVING_SCENE,
  SETTINGS_SCENE,
  START_SCENE,
} from '../app.constants';

@Update()
export class BotUpdate {
  @Hears(COMMANDS.HEARS)
  async onHears(@Ctx() ctx: IContext): Promise<void> {
    await ctx.scene.enter(RECEIVING_SCENE);
  }

  //开始使用机器人
  @Command(COMMANDS.START)
  async onStartCommand(@Ctx() ctx: IContext): Promise<void> {
    await ctx.scene.enter(START_SCENE);
  }

  @Command(COMMANDS.SETTINGS)
  async onSettingsCommand(@Ctx() ctx: IContext): Promise<void> {
    await ctx.scene.enter(SETTINGS_SCENE);
  }

  @Command([COMMANDS.ADD_ADMIN, COMMANDS.REMOVE_ADMIN, COMMANDS.ADMIN_LIST])
  async onAdminCommand(@Ctx() ctx: any): Promise<void> {
    await ctx.scene.enter(ADMIN_SCENE);
  }

  @Command([COMMANDS.CHAT, COMMANDS.UNCHAT])
  async onChatCommand(@Ctx() ctx: any): Promise<void> {
    await ctx.scene.enter(CHAT_SCENE);
  }

  @Command([COMMANDS.BAN, COMMANDS.UNBAN, COMMANDS.LIST_BAN])
  async onBanCommand(@Ctx() ctx: IContext): Promise<void> {
    await ctx.scene.enter(BAN_SCENE);
  }

  @Command(COMMANDS.POST)
  async onPostCommand(@Ctx() ctx: any): Promise<void> {
    await ctx.scene.enter(POST_SCENE);
  }

  @On('message')
  async handleImage(@Ctx() ctx: any) {
    await ctx.scene.enter(DATA_SCENE);
  }

  @On('edited_message')
  async handleEditCommand(@Ctx() ctx: any) {
    await ctx.scene.enter(DATA_SCENE);
  }
}
