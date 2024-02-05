import { Injectable } from '@nestjs/common';
import { log } from 'console';

@Injectable()
export class ToolService {
  constructor() {}

  isValidToken(token: string): boolean {
    // 正则表达式用于匹配 Telegram Bot token 的格式
    const regex = /^\d+:[\w-]{35}$/;
    const matched = regex.test(token);

    if (!matched) {
      log('Invalid token:', token);
    }

    return matched;
  }

  //⬆️ xxx 隐藏了他的帐户。\n回复此消息即可回复他。中提取出xxx
  getTelegramIdFromForwardedMessage(message: string): string {
    const regex = /⬆️ (\d+) 隐藏了他的帐户。\n回复此消息即可回复他。/;
    const matched = regex.exec(message);

    if (matched) {
      return matched[1];
    }

    return null;
  }

  //获取/ban xxxx中的xxx
  getCommandParams(text: string): string {
    const regex = /\/\w+ (\d+)/;
    const matched = regex.exec(text);

    if (matched) {
      return matched[1];
    }

    return null;
  }

  //把/post 后面的内容提取出来
  getPostContent(text: string): string {
    const regex = /\/post (.+)/;
    const matched = regex.exec(text);

    if (matched) {
      return matched[1];
    }

    return null;
  }

  //获取命令
  getCommand(text: string): string {
    const regex = /\/(\w+)/;
    const matched = regex.exec(text);

    if (matched) {
      return matched[1];
    }

    return null;
  }

  getReplyMessageId(text: string): string {
    const regex = /⬆️ (\d+) 隐藏了他的帐户。\n回复此消息即可回复他。 \[(\d+)\]/;
    const matched = regex.exec(text);

    if (matched) {
      return matched[2];
    }

    return null;
  }
}
