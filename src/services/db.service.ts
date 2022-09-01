import { User, PrismaClient, Provider } from "@prisma/client";
import { Client } from "discord.js";

const prisma = new PrismaClient();

/** DB */
export class DbService {
  constructor(public client: Client) {}

  run() {}

  /**
   * ユーザーの紐付けを登録・更新する。
   */
  async setUser({
    discordId,
    providers,
  }: {
    discordId: string;
    providers: Pick<Provider, "type" | "uid" | "token">[];
  }): Promise<User> {
    const habiticaProvider = providers.find(({ type }) => type === "HABITICA");
    if (habiticaProvider == null) throw new Error("provider is not found");
    return prisma.user
      .upsert({
        where: { discordId },
        create: { discordId, providers: { create: habiticaProvider } },
        update: {
          discordId,
          providers: {
            upsert: {
              where: {
                type_uid: {
                  type: habiticaProvider.type,
                  uid: habiticaProvider.uid,
                },
              },
              create: habiticaProvider,
              update: habiticaProvider,
            },
          },
        },
      })
      .finally(() => prisma.$disconnect());
  }

  /**
   * ユーザーの紐付けを削除する。
   */
  async deleteUser(discordId: string): Promise<void> {
    await prisma.user.update({
      where: { discordId },
      data: { providers: { deleteMany: {} } },
    });
    await prisma.user.delete({ where: { discordId } });
    await prisma.$disconnect();
  }
}
