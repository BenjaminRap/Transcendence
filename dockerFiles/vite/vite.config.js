import { defineConfig } from 'vite'
import fs from 'fs'

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
			}
		}
	},
	root: '/app/dev/',
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
		}
	],
	optimizeDeps: {
		exclude: ['@babylonjs/havok'],
	},
})
