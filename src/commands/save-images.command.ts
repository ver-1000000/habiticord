import { Message } from "discord.js";
import { Command } from "./command.interface";
import { DbService } from "../services/index.js";
import { MESSAGES } from "../messages.js";

/**
 * チャットログに流れてきた画像を保存するコマンド。
 */
export class SaveImageCommand implements Command {
  constructor(private db: DbService) {}

  /**
   * 実行関数のコール。
   */
  async execute(message: Message<boolean>) {
    try {
      await this.db.setImages(message.attachments);
      message.reply(MESSAGES.SUCCESS.ATTACHMENT_SAVED);
    } catch (e) {
      console.error(e);
      message.reply(MESSAGES.ERROR.UNKNOWN);
    }
  }
}
