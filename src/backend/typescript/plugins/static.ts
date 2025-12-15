import fp from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import { join } from "path";

export default fp(async function staticPlugin(fastify) {
    const avatarDir = process.env.AVATAR_DIR_PATH || join(process.cwd(), "uploads/avatars");

    fastify.register(fastifyStatic, {
        root: avatarDir,
        prefix: "/static/avatars/",
        decorateReply: false,
    });

    fastify.register(fastifyStatic, {
        root: "/app/backend/public/",
        prefix: "/static/public/",
        decorateReply: false,
    });

    fastify.log.info("Static files plugin loaded");
});
