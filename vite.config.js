import { defineConfig } from 'vite'
import path from 'path';

export default defineConfig({
	root: './src/frontend/dev/',
	build: {
		outDir: '../../../dockerFiles/nginx/website/',  // IMPORTANT : chemin relatif à root
		emptyOutDir: true   // vide le dossier prod avant chaque build
	},
	publicDir: 'public',   // ce chemin est relatif à root (donc dev/public)
	optimizeDeps: {
		exclude: ['@babylonjs/havok'],
	},
	resolve: {
		alias: {
			"@shared": path.resolve(__dirname, "./src/shared/")
		}
	}
})
