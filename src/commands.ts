import fetch from "node-fetch";
import {
  ApplicationCommandDataResolvable,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  ModalSubmitInteraction,
  TextInputStyle,
} from "discord.js";
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
} from "@discordjs/builders";
import { DbService } from "./services/db.service";
import { HABITICA_ENDPOINT } from "./environment.js";

const COMMANDS: ApplicationCommandDataResolvable[] = [
  {
    name: "habitica",
    description: "DiscordでHabiticaをたのしもう！",
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: "register",
        description: "HabiticordにHabiticaアカウントを紐付ける",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "unregister",
        description: "HabiticordからHabiticaアカウントを削除する",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "status",
        description: "現在のステータスを表示する",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "tasks",
        description: "タスクのサブコマンドグループ",
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [
          { name: "habits", description: "習慣を表示する" },
          { name: "dailys", description: "日課を表示する" },
          { name: "todos", description: "To Doを表示する" },
          { name: "rewards", description: "ごほうびを表示する" },
        ].map((option) => ({
          ...option,
          type: ApplicationCommandOptionType.Subcommand,
        })),
      },
    ],
  },
];

const MSGS = {
  ERROR: {
    UNKNOWN: "原因不明のエラーが発生しました……。",
    REGISTER: {
      RECONFIRM:
        "登録に失敗しました……。 もう一度ユーザーIDとAPIトークンを確認してください。",
    },
  },
  SUCCESS: {
    REGISTER: "登録が完了しました♪",
    UNREGISTER: "削除が完了しました♪",
  },
} as const;

/** コマンド TODO: 機能分割 */
export class Commands {
  api = {
    getTasks: async ({ id, token }: { id: string; token: string }) => {
      const params = new URLSearchParams({ type: "todos" });
      return await fetch(`${HABITICA_ENDPOINT}/tasks/user?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-user": id,
          "x-api-key": token,
        },
      });
    },
  };

  constructor(
    private client: Client,
    private db: DbService,
  ) {}

  async run() {
    this.commandsSet();
    this.on();
  }

  /**
   * Discordサーバーにコマンドを登録する。
   */
  private async commandsSet(): Promise<void> {
    await this.client.application?.commands.set(COMMANDS);
  }

  /**
   * "interactionCreate"イベントの監視を開始する。
   */
  private on() {
    this.client.on("interactionCreate", async (interaction) => {
      if (interaction.isChatInputCommand())
        await this.recieveChatInputCommand(interaction);
      if (interaction.isModalSubmit())
        await this.recieveModalSubmit(interaction);
    });
  }

  /**
   * ChatInputCommandInteractionを受け取った際の処理振り分け。
   */
  async recieveChatInputCommand(interaction: ChatInputCommandInteraction) {
    const commandName = interaction.commandName;
    const subcommand = interaction.options.getSubcommand();
    const subcommandGroup = interaction.options.getSubcommandGroup();
    if (commandName !== "habitica") return;
    if (subcommand === "register") await this.register(interaction);
    if (subcommand === "unregister") await this.unregister(interaction);
    if (subcommand === "status") interaction.reply("未実装♪");
    if (subcommandGroup === "tasks") interaction.reply(`${subcommand} 未実装♪`);
  }

  /**
   * ModalSubmitを受け取った際の処理振り分け。
   */
  async recieveModalSubmit(interaction: ModalSubmitInteraction<CacheType>) {
    if (interaction.customId === "registerModal")
      await this.registerModal(interaction);
  }

  /**
   * アカウントの紐付けを行う。
   */
  async register(interaction: ChatInputCommandInteraction) {
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

  /**
   * アカウントの紐付けを解除する。
   */
  async unregister(interaction: ChatInputCommandInteraction) {
    try {
      await this.db.deleteUser(interaction.user.id);
      interaction.reply(MSGS.SUCCESS.UNREGISTER);
    } catch (e) {
      console.error(e);
      interaction.reply(MSGS.ERROR.UNKNOWN);
    }
  }

  /**
   * ユーザー登録するためのモーダルを表示する。
   */
  async registerModal(interaction: ModalSubmitInteraction) {
    const id = interaction.fields.getTextInputValue("idInput");
    const token = interaction.fields.getTextInputValue("tokenInput");
    const { status } = await this.api.getTasks({ id, token });
    try {
      if (status !== 200) {
        interaction.reply(MSGS.ERROR.REGISTER.RECONFIRM);
        return;
      }
      const providers = [{ type: "HABITICA", uid: id, token }];
      const user = { discordId: interaction.user.id, providers };
      await this.db.setUser(user);
      interaction.reply(MSGS.SUCCESS.REGISTER);
    } catch (e) {
      console.error(e);
      interaction.reply(MSGS.ERROR.UNKNOWN);
    }
  }
}
