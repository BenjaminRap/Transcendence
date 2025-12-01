import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path';
import swc from "@z-code/vite-plugin-swc";

export default defineConfig({
	server: {
		host: '0.0.0.0',
		port: 443,
		https: {
			key: fs.readFileSync('/run/secrets/ssl_key'),
			cert: fs.readFileSync('/run/secrets/ssl_crt'),
			minVersion: 'TLSv1.3',
			ciphers: 'HIGH:!aNULL:!MD5'
		},
		proxy: {
			'/api': {
				target: 'http://fastify:8181',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
			'/api/socket.io': {
				target: 'http://fastify:8181',
				changeOrigin: true,
				ws: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
			}
		}
	},
	root: '/app/frontend/',
	plugins: [
		{
			name: 'set-babylon-json-header',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					if (req.url && req.url.endsWith('.babylon')) {
						res.setHeader('Content-Type', 'application/json');
					}
					next();
				});
			}
		},
		swc({
			include: /\.ts?$/,
			exclude: "node_modules",
			swcrc: false,
			configFile: false,
			minify: false,
			jsc: {
			  parser: {
				syntax: "typescript",
				decorators: true,
			  },
			  transform: {
				decoratorMetadata: true,
				legacyDecorator: true,
				useDefineForClassFields: false,
				verbatimModuleSyntax: true
			  },
			},
		})
	],
	optimizeDeps: {
		exclude: ['@babylonjs/havok'],
	},
	resolve: {
		alias: {
			"@shared": path.resolve(__dirname, "./shared")
		}
	}
})
