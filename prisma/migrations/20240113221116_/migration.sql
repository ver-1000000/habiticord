-- CreateTable
CREATE TABLE "DiscordAttachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "attachmentId" TEXT NOT NULL,
    "contentType" TEXT,
    "description" TEXT,
    "duration" INTEGER,
    "ephemeral" BOOLEAN NOT NULL,
    "height" INTEGER,
    "name" TEXT NOT NULL,
    "proxyURL" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "spoiler" BOOLEAN NOT NULL,
    "url" TEXT NOT NULL,
    "waveform" TEXT,
    "width" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordAttachment_attachmentId_key" ON "DiscordAttachment"("attachmentId");
