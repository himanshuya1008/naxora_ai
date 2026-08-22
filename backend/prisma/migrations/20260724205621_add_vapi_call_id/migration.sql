-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "vapiCallId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_vapiCallId_key" ON "Conversation"("vapiCallId");
