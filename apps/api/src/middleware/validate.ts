import { FastifyReply, FastifyRequest } from "fastify";
import { z, ZodError, ZodSchema } from "zod";

type ValidationTarget = "body" | "params" | "query";

export function validate(schema: ZodSchema, target: ValidationTarget = "body") {
  return async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const data = request[target];
    const effectiveSchema =
      target === "params" && schema instanceof z.ZodObject
        ? schema.passthrough()
        : schema;
    const result = effectiveSchema.safeParse(data);

    if (!result.success) {
      reply.status(400).send(validationError(result.error));
      return;
    }

    if (target === "body") {
      (request as any).body = result.data;
    } else if (target === "params" || target === "query") {
      (request as any)[target] = result.data;
    }
  };
}

/**
 * 400 payload for an invalid body/params/query. Bad `id`/`guildId` route params
 * used to reach Prisma and surface as an opaque 500 (`Invalid cuid`) or, worse,
 * a cast error; they are client errors and must say so.
 */
export function validationError(err: ZodError): {
  success: false;
  error: string;
  details: unknown;
} {
  const flat = err.flatten();
  const first = err.errors[0];
  const field = first?.path.join(".");
  return {
    success: false,
    error: field ? `${field}: ${first.message}` : "Données invalides",
    details: flat.fieldErrors,
  };
}

export function validateBody(schema: ZodSchema) {
  return validate(schema, "body");
}

export function validateParams(schema: ZodSchema) {
  return validate(schema, "params");
}

export function validateQuery(schema: ZodSchema) {
  return validate(schema, "query");
}
