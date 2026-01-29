import fp from "fastify-plugin";
import multipart from "@fastify/multipart";
import { MAX_FILE_SIZE } from "../types/file.types.js";

export default fp(async function multipartPlugin(fastify) {
    fastify.register(multipart, {
        limits: {
            fileSize: MAX_FILE_SIZE,
            files: 1,
        },
        attachFieldsToBody: false,
    });

    fastify.log.info("Multipart plugin loaded.");
});
