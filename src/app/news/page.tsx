// src/app/news/page.tsx 

export const dynamic = 'force-dynamic'; 

import React from 'react';
import { sanityClient } from '@/lib/sanityClient';
import { groq } from 'next-sanity';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import NewsListClient from './NewsListClient';

// Тип данных 
interface NewsPostSanity {
  _id: string;
  title?: string | null;
  slug?: { current?: string | null } | null;
  publishedAt?: string | null;
  excerpt?: string | null;
  mainImage?: { asset?: SanityImageSource | null; alt?: string | null } | null;
}

// Запрос GROQ
const newsQuery = groq`*[_type == "newsPost"] | order(publishedAt desc) {
  _id, title, slug, publishedAt, excerpt, mainImage { asset, alt }
}`;

// Основной компонент страницы (Серверный)
export default async function NewsListPage() {

  let newsItems: NewsPostSanity[] = [];
  let fetchError: string | null = null;

  if (!sanityClient) {
     console.error("Sanity client is not configured.");
     fetchError = "Ошибка конфигурации Sanity.";
  } else {
      try {
         newsItems = await sanityClient.fetch<NewsPostSanity[]>(newsQuery); 
      } catch (error: unknown) {
         console.error("Ошибка загрузки новостей из Sanity:", error);
         const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
         fetchError = `Не удалось загрузить новости: ${message}`;
      }
  }

  // Рендерим клиентский компонент и передаем ему данные
  return <NewsListClient newsItems={newsItems} fetchError={fetchError} />;
}