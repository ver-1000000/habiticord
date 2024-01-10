import { CacheType, Interaction, Message } from "discord.js";

export interface Command {
  execute(
    interaction: Interaction<CacheType> | Message<boolean>,
  ): Promise<void>;
}
