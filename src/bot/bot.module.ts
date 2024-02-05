import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { ToolService } from 'src/common/utils/tool.service';
import { SettingsScene } from './scenes/settings.scene';
import { StartScene } from './scenes/start.scene';
import { BotService } from './services/bot.service';
import { PrismaService } from './services/prisma.service';
import { BanScene } from './scenes/ban.scene';
import { ReceivingScene } from './scenes/receiving.scene';
import { AdminScene } from './scenes/admin.scene';
import { ChatScene } from './scenes/chat.scene';
import { PostScene } from './scenes/post.scene';
import { DataScene } from './scenes/data.scene';

@Module({
  imports: [],
  providers: [
    BotUpdate,
    SettingsScene,
    StartScene,
    BanScene,
    ReceivingScene,
    AdminScene,
    ChatScene,
    PostScene,
    DataScene,
    ToolService,
    PrismaService,
    BotService,
  ],
})
export class BotModule {}
