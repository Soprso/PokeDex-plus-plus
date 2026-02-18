#!/usr/bin/env node
/**
 * generate-sitemap.mjs
 *
 * Fetches all Pokémon from the PokeAPI and generates a sitemap.xml
 * with individual detail page URLs for Google indexing.
 *
 * Usage: node generate-sitemap.mjs
 */

import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://pokedexplus.shop';
const TODAY = new Date().toISOString().split('T')[0];

async function generateSitemap() {
    console.log('Fetching Pokémon list from PokeAPI...');

    // Fetch all Pokémon (limit 1025 covers Gen 1-9)
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0');
    if (!res.ok) throw new Error(`PokeAPI error: ${res.status}`);
    const data = await res.json();

    const pokemonList = data.results;
    console.log(`Found ${pokemonList.length} Pokémon.`);

    // Static pages
    const staticPages = [
        { loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0' },
        { loc: `${BASE_URL}/shop`, changefreq: 'weekly', priority: '0.8' },
        { loc: `${BASE_URL}/pokehub`, changefreq: 'weekly', priority: '0.8' },
    ];

    // Build XML
    const urlEntries = [
        // Static pages
        ...staticPages.map(page => `
  <url>
    <loc>${page.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`),

        // Pokémon detail pages
        ...pokemonList.map(pokemon => `
  <url>
    <loc>${BASE_URL}/details/${pokemon.name}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('')}
</urlset>
`;

    const outputPath = join(__dirname, 'public', 'sitemap.xml');
    writeFileSync(outputPath, xml, 'utf-8');
    console.log(`✅ Sitemap written to ${outputPath}`);
    console.log(`   Static pages: ${staticPages.length}`);
    console.log(`   Pokémon pages: ${pokemonList.length}`);
    console.log(`   Total URLs: ${staticPages.length + pokemonList.length}`);
}

generateSitemap().catch(err => {
    console.error('❌ Failed to generate sitemap:', err);
    process.exit(1);
});
