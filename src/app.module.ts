import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotName } from './app.constants';
import { BotModule } from './bot/bot.module';
import { session } from 'telegraf';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      botName: BotName,
      useFactory: () => ({
        token: process.env.BOT_TOKEN,
        middlewares: [session()],
        include: [BotModule],
      }),
    }),
    BotModule,
  ],
  exports: [],
  providers: [],
})
export class AppModule {}
