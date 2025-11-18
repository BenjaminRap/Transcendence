import fp from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import { join } from "path";

export default fp(async function staticPlugin(fastify) {
    const uploadDir = join(process.cwd(), "uploads");

    fastify.register(fastifyStatic, {
        root: uploadDir,
        prefix: "/uploads/",
        decorateReply: false,
    });

    fastify.log.info("Static files plugin loaded");
});
