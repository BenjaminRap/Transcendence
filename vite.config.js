import { defineConfig } from 'vite'
import path from 'path';
import swc from "@z-code/vite-plugin-swc";

export default defineConfig({
	root: './src/frontend/dev/',
	plugins: [swc({
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
	})],
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
