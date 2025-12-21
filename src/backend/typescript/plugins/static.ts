import fp from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import path, { join } from "path";

export default fp(async function staticPlugin(fastify) {
    const avatarDir = process.env.AVATAR_DIR_PATH || join(process.cwd(), "uploads/avatars");

    await fastify.register(fastifyStatic, {
        root: avatarDir,
        prefix: "/static/avatars/",
        decorateReply: false,
    });

    await fastify.register(fastifyStatic, {
        root: "/app/backend/public/",
        prefix: "/static/public/",
        decorateReply: false,
    });
    const	scenesDir = path.join(process.cwd(), "dev", "scenes");

    await fastify.register(fastifyStatic, {
        root : scenesDir,
        prefix: "/scenes/"
    });

    fastify.log.info("Static files plugin loaded");
});
