import { ActivityType, Client, ClientUser, IntentsBitField } from "discord.js";
import { DISCORD_TOKEN } from "./environment.js";
import {
  DbService,
  HabiticaAPIService,
  CommandsHandlerService,
} from "./services/index.js";
import {
  RegisterCommand,
  RegisterModalCommand,
  UnregisterCommand,
} from "./commands/index.js";

/** 起点となるメインのアプリケーションクラス。 */
class Bootstrap {
  constructor(private client: Client) {}

  /** アプリケーションクラスを起動する。 */
  async run() {
    this.confirmToken();
    const ready = new Promise((resolve) => this.client.on("ready", resolve));
    await this.client.login(DISCORD_TOKEN);
    await ready;
    console.log("\x1b[36m\x1b[1m [*** READY - started server ***]\x1b[0m");
    this.initializeBotStatus(this.client.user);
  }

  /** DISCORD_TOKENが設定されていなければ異常終了させる。 */
  private confirmToken() {
    if (DISCORD_TOKEN) return;
    console.log("DISCORD_TOKENが設定されていません。");
    process.exit(1);
  }

  /** readyイベントにフックして、ボットのステータスなどを設定する。 */
  private initializeBotStatus(user: ClientUser | null) {
    const activities = [{ name: "Habitica", type: ActivityType.Competing }];
    user?.setPresence({ activities });
  }
}

/** 依存を解決しつつアプリケーションを起動する。 */
(async () => {
  const intents = [
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.MessageContent,
  ];
  const client = new Client({ intents });
  const db = new DbService(client);
  const api = new HabiticaAPIService();
  const registerModal = new RegisterModalCommand(db, api);
  const register = new RegisterCommand();
  const unregister = new UnregisterCommand(db);
  await new Bootstrap(client).run();
  await new CommandsHandlerService(
    client,
    registerModal,
    register,
    unregister,
  ).run();
})();
