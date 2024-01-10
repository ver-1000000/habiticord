import { ActivityType, Client, ClientUser, IntentsBitField } from "discord.js";
import { DISCORD_TOKEN } from "./environment.js";
import { DbService } from "./services/db.service.js";
import { Commands } from "./commands.js";

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
  ];
  const client = new Client({ intents });
  const dbService = new DbService(client);
  await new Bootstrap(client).run();
  await new Commands(client, dbService).run();
})();
