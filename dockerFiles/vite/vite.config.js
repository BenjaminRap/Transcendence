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
	root: '/app/public/',
})
