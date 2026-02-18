import { Helmet } from 'react-helmet-async';

interface PokemonSEOProps {
    name: string;
    id: number;
    description: string;
    imageUrl: string;
    types: string[];
}

/**
 * Injects per-Pokémon SEO meta tags into <head> for Google indexing.
 * Used on the /details/:name route so each Pokémon gets its own crawlable page.
 */
export default function PokemonSEO({ name, id, description, imageUrl, types }: PokemonSEOProps) {
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    const pageTitle = `${displayName} | PokeDex Plus Plus`;
    const canonicalUrl = `https://pokedexplus.shop/details/${name}`;
    const metaDescription = description
        ? `${displayName} (#${String(id).padStart(3, '0')}) — ${description}`
        : `Explore ${displayName} (#${String(id).padStart(3, '0')}), a ${types.join('/')} type Pokémon. View stats, moves, evolutions, and more on PokeDex Plus Plus.`;

    return (
        <Helmet>
            {/* Primary */}
            <title>{pageTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="PokeDex Plus Plus" />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:url" content={canonicalUrl} />
            {imageUrl && <meta property="og:image" content={imageUrl} />}
            {imageUrl && <meta property="og:image:alt" content={`${displayName} official artwork`} />}
            <meta property="og:image:width" content="475" />
            <meta property="og:image:height" content="475" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={metaDescription} />
            {imageUrl && <meta name="twitter:image" content={imageUrl} />}
            {imageUrl && <meta name="twitter:image:alt" content={`${displayName} official artwork`} />}

            {/* Structured Data (JSON-LD) */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": pageTitle,
                    "description": metaDescription,
                    "url": canonicalUrl,
                    "image": imageUrl,
                    "isPartOf": {
                        "@type": "WebSite",
                        "name": "PokeDex Plus Plus",
                        "url": "https://pokedexplus.shop"
                    }
                })}
            </script>
        </Helmet>
    );
}
