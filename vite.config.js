import { defineConfig } from 'vite'

export default defineConfig({
	root: './src/frontend/dev/',
	build: {
		outDir: '../../../dockerFiles/nginx/website/',  // IMPORTANT : chemin relatif à root
		emptyOutDir: true   // vide le dossier prod avant chaque build
	},
	publicDir: 'public',   // ce chemin est relatif à root (donc dev/public)
	optimizeDeps: {
		exclude: ['@babylonjs/havok'],
	}
})
