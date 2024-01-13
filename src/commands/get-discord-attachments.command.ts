import {
  AttachmentBuilder,
  BaseMessageOptions,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "./command.interface";
import { DbService } from "../services/index.js";
import { MESSAGES } from "../messages.js";

/**
 * 登録されているAttachment一覧を表示するコマンド。
 */
export class GetDiscordAttachmentCommand implements Command {
  constructor(private db: DbService) {}

  /**
   * 実行関数のコール。
   */
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      interaction.reply(await this.getReply());
    } catch (e) {
      console.error(e);
      interaction.reply(MESSAGES.ERROR.UNKNOWN);
    }
  }

  /**
   * DBから取得したDiscordAttachmentの配列から、
   * 整形したAttachmentBuilderの配列を返す。
   */
  private async getReply(): Promise<BaseMessageOptions> {
    const attachments = await this.db.getDiscordAttachments();
    const files = attachments.map(
      ({ proxyURL }) => new AttachmentBuilder(proxyURL),
    );
    const content =
      files.length === 0 ? "アタッチメントは登録されていません。" : undefined;
    return { files, content };
  }
}
