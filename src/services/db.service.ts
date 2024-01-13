import {
  User,
  PrismaClient,
  Provider,
  DiscordAttachment,
} from "@prisma/client";
import { Attachment, Client, Collection } from "discord.js";

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

  /**
   * DiscordAttachmentの情報を登録・更新する。
   */
  async setImages(
    attachments: Collection<string, Attachment>,
  ): Promise<DiscordAttachment[]> {
    const images = attachments
      .map<Omit<DiscordAttachment, "id">>((attachment) => ({
        attachmentId: attachment.id,
        contentType: attachment.contentType,
        description: attachment.description,
        duration: attachment.duration,
        ephemeral: attachment.ephemeral,
        height: attachment.height,
        name: attachment.name,
        proxyURL: attachment.proxyURL,
        size: attachment.size,
        spoiler: attachment.spoiler,
        url: attachment.url,
        waveform: attachment.waveform,
        width: attachment.width,
      }))
      .filter((attachment) => attachment.contentType?.startsWith("image/"));
    const query = images.map((image) =>
      prisma.discordAttachment.upsert({
        where: { attachmentId: image.attachmentId },
        create: image,
        update: image,
      }),
    );
    return await prisma.$transaction(query).finally(() => prisma.$disconnect());
  }

  /**
   * DiscordAttachmentの情報をすべて取得する。
   */
  async getDiscordAttachments(): Promise<DiscordAttachment[]> {
    return await prisma.discordAttachment
      .findMany()
      .finally(() => prisma.$disconnect());
  }

  /**
   * DiscordAttachmentの情報をすべて削除する。
   */
  async deleteDiscordAttachments(): Promise<void> {
    await prisma.discordAttachment
      .deleteMany()
      .finally(() => prisma.$disconnect());
  }
}
