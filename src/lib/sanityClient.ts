// src/lib/sanityClient.ts
import { createClient, type ClientConfig } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
// Удаляем SanityImageObject из этого импорта, так как он не используется
import type { SanityImageSource as OriginalSanityImageSource, SanityAsset, SanityReference } from '@sanity/image-url/lib/types/types';

export type SanityImageSource = OriginalSanityImageSource;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-10';
const useCdn = process.env.NODE_ENV === 'production';

if (!projectId) {
  throw new Error("Configuration error: NEXT_PUBLIC_SANITY_PROJECT_ID is not defined in .env files");
}
if (!dataset) {
  throw new Error("Configuration error: NEXT_PUBLIC_SANITY_DATASET is not defined in .env files");
}

const config: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn,
};

export const sanityClient = createClient(config);
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource | undefined | null) {
  if (!source) {
    return null;
  }

  if (typeof source === 'object' && source !== null) {
    const isSanityReference = '_ref' in source && typeof (source as SanityReference)._ref === 'string';
    const isSanityAsset = '_id' in source && 'url' in source && typeof (source as SanityAsset).url === 'string';
    const hasAssetProperty = 'asset' in source && typeof source.asset === 'object' && source.asset !== null;
    let isValidAssetLinkInObject = false;
    if (hasAssetProperty) {
        const assetLink = source.asset as (SanityReference | SanityAsset);
        isValidAssetLinkInObject = ('_ref' in assetLink && typeof assetLink._ref === 'string') ||
                                   ('_id' in assetLink && 'url' in assetLink && typeof assetLink.url === 'string');
    }
    const hasTypeField = '_type' in source && typeof source._type === 'string';

    if (!isSanityReference && !isSanityAsset && !isValidAssetLinkInObject && !hasTypeField) {
        // console.warn("urlFor called with an object that doesn't appear to be a valid Sanity image source:", source);
        return null;
    }
  } else if (typeof source !== 'string') {
    // console.warn("urlFor called with invalid source type:", source);
    return null;
  }

  try {
    return builder.image(source as OriginalSanityImageSource);
  } catch (error) {
    console.error("Error in urlFor while building image URL:", error, "Source was:", source);
    return null;
  }
}