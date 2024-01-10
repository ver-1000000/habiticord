import { ModalSubmitInteraction } from "discord.js";
import { Command } from "./command.interface.js";
import { MESSAGES } from "../messages.js";
import { DbService } from "../services/db.service";
import { HabiticaAPIService } from "../services/habitica-api.service";

/**
 * ユーザー登録するためのモーダルを表示する。
 */
export class RegisterModalCommand implements Command {
  constructor(
    private db: DbService,
    private api: HabiticaAPIService,
  ) {}

  /**
   * 実行関数のコール。
   */
  async execute(interaction: ModalSubmitInteraction) {
    const id = interaction.fields.getTextInputValue("idInput");
    const token = interaction.fields.getTextInputValue("tokenInput");
    const { status } = await this.api.getTasks({ id, token });
    try {
      if (status !== 200) {
        interaction.reply(MESSAGES.ERROR.REGISTER.RECONFIRM);
        return;
      }
      const providers = [{ type: "HABITICA", uid: id, token }];
      const user = { discordId: interaction.user.id, providers };
      await this.db.setUser(user);
      interaction.reply(MESSAGES.SUCCESS.REGISTER);
    } catch (e) {
      console.error(e);
      interaction.reply(MESSAGES.ERROR.UNKNOWN);
    }
  }
}
