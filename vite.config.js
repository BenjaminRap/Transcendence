import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	root: './src/frontend/dev/',
	appType: 'mpa',
	build: {
		outDir: '../../../dockerFiles/nginx/website/',  // IMPORTANT : chemin relatif à root
		emptyOutDir: true   // vide le dossier prod avant chaque build
	},
	publicDir: 'public',   // ce chemin est relatif à root (donc dev/public)
	plugins: [
		tailwindcss()
	]
})
