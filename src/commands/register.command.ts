import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Command } from "./command.interface";

/**
 * HabiticaユーザをDiscordユーザに紐付けるためのCommand。
 */
export class RegisterCommand implements Command {
  /**
   * 実行関数のコール。
   */
  async execute(interaction: ChatInputCommandInteraction) {
    const modal = new ModalBuilder()
      .setCustomId("registerModal")
      .setTitle("HabiticordにHabiticaアカウントを紐付ける");
    const INPUTS = [
      ["idInput", "HabiticaのユーザーID"],
      ["tokenInput", "HabiticaのAPIトークン"],
    ] as const;
    const [idInput, tokenInput] = INPUTS.map(([id, label]) =>
      new TextInputBuilder()
        .setCustomId(id)
        .setLabel(label)
        .setStyle(TextInputStyle.Short),
    );
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(idInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(tokenInput),
    );
    return await interaction.showModal(modal);
  }
}
