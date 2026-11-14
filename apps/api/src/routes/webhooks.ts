import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@pinguin/db";
import { getConfig } from "@pinguin/config";
import { success, error, sanitizeError } from "../utils/response";
import * as DeployService from "../services/deploy";

export async function webhookRoutes(app: FastifyInstance) {
  app.post("/github", async (request: FastifyRequest, reply: FastifyReply) => {
    const event = request.headers["x-github-event"] as string;
    const body = request.body as { ref?: string } | null;

    if (!event) {
      return reply.status(400).send(error("En-tête x-github-event manquant"));
    }

    if (event === "ping") {
      return reply.send(success({ message: "pong" }));
    }

    if (
      event === "push" &&
      body?.ref === `refs/heads/${getConfig().GITHUB_BRANCH}`
    ) {
      try {
        const ownerId = getConfig().DISCORD_OWNER_ID;
        const owner = await prisma.user.findUnique({
          where: { discordId: ownerId },
        });

        const result = await DeployService.startDeployment(
          owner?.id || "webhook",
        );

        reply.send(success(result, "Déploiement automatique démarré"));
      } catch (err: unknown) {
        reply.status(500).send(error(sanitizeError(err)));
      }
    } else {
      reply.send(success({ ignored: true, event }));
    }
  });
}
