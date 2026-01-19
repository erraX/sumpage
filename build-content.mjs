import esbuild from 'esbuild';
import { rename } from 'fs/promises';

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['src/content/content.tsx', 'src/content/sidebar-inject.ts'],
      bundle: true,
      outdir: 'dist',
      format: 'iife',
      platform: 'browser',
      minify: true,
      sourcemap: true,
      target: ['es2020'],
    });

    // Rename files to expected names
    await rename('dist/content.js', 'dist/sidebar.js');
    await rename('dist/content.js.map', 'dist/sidebar.js.map');

    console.log('Content scripts built successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
