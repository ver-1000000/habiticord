import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "./command.interface";
import { DbService } from "../services/index.js";
import { MESSAGES } from "../messages.js";

/**
 * 登録されているAttachmentすべてを削除するコマンド。
 */
export class DeleteDiscordAttachmentsCommand implements Command {
  constructor(private db: DbService) {}

  /**
   * 実行関数のコール。
   */
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await this.db.deleteDiscordAttachments();
      interaction.reply(MESSAGES.SUCCESS.ATTACHMENT_DELETED);
    } catch (e) {
      console.error(e);
      interaction.reply(MESSAGES.ERROR.UNKNOWN);
    }
  }
}
