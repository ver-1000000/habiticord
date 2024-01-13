import {
  ApplicationCommandDataResolvable,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  Message,
  ModalSubmitInteraction,
} from "discord.js";
import {
  DeleteDiscordAttachmentsCommand,
  GetDiscordAttachmentCommand,
  RegisterCommand,
  RegisterModalCommand,
  SaveImageCommand,
  UnregisterCommand,
} from "../commands/index.js";

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
      {
        name: "attachments",
        description: "DiscordAttachmentsのサブコマンドグループ",
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [
          {
            name: "list",
            description: "登録されたDiscordAttachment一覧を表示する",
          },
          {
            name: "delete",
            description: "登録されたDiscordAttachmentをすべて削除する",
          },
        ].map((option) => ({
          ...option,
          type: ApplicationCommandOptionType.Subcommand,
        })),
      },
    ],
  },
];

/**
 * Discordのイベントを受け取り、アプリのコマンドに振り分けるためのサービス。
 */
export class CommandsHandlerService {
  constructor(
    private client: Client,
    private deleteDiscordAttachments: DeleteDiscordAttachmentsCommand,
    private getDiscordAttachments: GetDiscordAttachmentCommand,
    private registerModal: RegisterModalCommand,
    private register: RegisterCommand,
    private saveImages: SaveImageCommand,
    private unregister: UnregisterCommand,
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
    // スラッシュコマンドの登録
    this.client.on("interactionCreate", async (interaction) => {
      if (interaction.isChatInputCommand())
        await this.recieveChatInputCommand(interaction);
      if (interaction.isModalSubmit())
        await this.recieveModalSubmit(interaction);
    });
    // チャットログの監視
    this.client.on("messageCreate", async (message) => {
      if (message.author.bot) return;
      if (message.attachments.size > 0)
        await this.recieveMessageCreate(message);
    });
  }

  /**
   * ChatInputCommandInteractionを受け取った際の処理振り分け。
   */
  private async recieveChatInputCommand(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    const commandName = interaction.commandName;
    const subcommand = interaction.options.getSubcommand();
    const subcommandGroup = interaction.options.getSubcommandGroup();
    if (commandName !== "habitica") return;
    if (subcommand === "register") await this.register.execute(interaction);
    if (subcommand === "unregister") await this.unregister.execute(interaction);
    if (subcommand === "status") interaction.reply("未実装♪");
    if (subcommandGroup === "tasks") interaction.reply(`${subcommand} 未実装♪`);
    if (subcommandGroup === "attachments") {
      if (subcommand === "list")
        await this.getDiscordAttachments.execute(interaction);
      if (subcommand === "delete")
        await this.deleteDiscordAttachments.execute(interaction);
    }
  }

  /**
   * ModalSubmitを受け取った際の処理振り分け。
   */
  private async recieveModalSubmit(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<void> {
    if (interaction.customId === "registerModal")
      await this.registerModal.execute(interaction);
  }

  /**
   * 特定のメッセージがチャットログに投稿された際の処理振り分け。
   */
  private async recieveMessageCreate(message: Message): Promise<void> {
    if (message.attachments.some((x) => x.contentType?.startsWith("image")))
      await this.saveImages.execute(message);
  }
}
