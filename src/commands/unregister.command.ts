import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "./command.interface";
import { MESSAGES } from "../messages.js";
import { DbService } from "../services/db.service";

/**
 * HabiticaユーザとDiscordユーザの紐付けを解除するためのCommand。
 */
export class UnregisterCommand implements Command {
  constructor(private db: DbService) {}

  /**
   * 実行関数のコール。
   */
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await this.db.deleteUser(interaction.user.id);
      interaction.reply(MESSAGES.SUCCESS.UNREGISTER);
    } catch (e) {
      console.error(e);
      interaction.reply(MESSAGES.ERROR.UNKNOWN);
    }
  }
}
