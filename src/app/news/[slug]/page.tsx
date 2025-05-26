// src/app/news/[slug]/page.tsx
// 'use client'; // УБИРАЕМ ЭТО, ТАК КАК КОМПОНЕНТ СТАНОВИТСЯ СЕРВЕРНЫМ ИЗ-ЗА ASYNC
// Если какая-то часть этой страницы требует КЛИЕНТСКОЙ интерактивности
// (useState, useEffect, onClick), ее нужно будет вынести в отдельный компонент с 'use client';

import React from 'react';
import { sanityClient, urlFor } from '@/lib/sanityClient';
import { groq } from 'next-sanity';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import singlePostStyles from './singlePost.module.css';
import Link from 'next/link';
import type { SanityImageSource, SanityAsset } from '@sanity/image-url/lib/types/types';
import type { PortableTextBlock } from '@portabletext/types';

interface CustomSanityAsset extends SanityAsset {
  _ref?: string;
}

interface FullNewsPost {
  _id: string;
  title?: string | null;
  publishedAt?: string | null;
  mainImage?: { asset?: CustomSanityAsset | null; alt?: string | null } | null;
  body?: PortableTextBlock[] | null;
}

// Тип для РАЗРЕШЕННЫХ параметров
interface ResolvedPageParams {
  slug: string;
}

// Тип для пропсов, params теперь Promise
interface PageProps {
  params: Promise<ResolvedPageParams>; // Next.js для async RSC передает params как Promise
}

const singleNewsQuery = groq`*[_type == "newsPost" && slug.current == $slug][0] {
  _id, title, publishedAt, mainImage { asset, alt }, body
}`;

export default async function SingleNewsPage({ params }: PageProps) {
  // РАЗВОРАЧИВАЕМ ПРОМИС PARAMS
  const resolvedParams = await params;
  const { slug } = resolvedParams; // Теперь slug точно string

  let post: FullNewsPost | null = null;
  let fetchError: string | null = null;

  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      fetchError = "Идентификатор новости (slug) некорректен или отсутствует.";
  } else if (!sanityClient) {
    console.error("Sanity client is not configured.");
    fetchError = "Ошибка конфигурации Sanity.";
  } else {
    try {
      post = await sanityClient.fetch<FullNewsPost | null>(singleNewsQuery, { slug });
      if (!post) { // Явная проверка, если fetch вернул null (новость не найдена)
        fetchError = `К сожалению, новость с адресом "${slug}" не существует.`;
      }
    } catch (error: unknown) {
      console.error("Ошибка загрузки новости:", error);
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      fetchError = `Не удалось загрузить новость: ${message}`;
    }
  }

  if (fetchError || !post) {
     const errorTitle = fetchError && post === null ? 'Ошибка загрузки' : 'Новость не найдена'; // Уточняем заголовок
     const errorMessage = fetchError ?? `К сожалению, новость с адресом "${slug}" не существует.`;
     return (
       <div className={singlePostStyles.messageContainer}>
         <h1 className={singlePostStyles.title}>
             {errorTitle}
         </h1>
         <p>{errorMessage}</p>
         <Link href="/news" className={singlePostStyles.backLink} style={{marginTop: '2rem'}}>
           ← Назад ко всем новостям
         </Link>
       </div>
     );
  }

  const imageAsset = post.mainImage?.asset;
  let imageUrl: string | null = null;

  if (imageAsset) {
    const projectId = sanityClient.config().projectId;
    const dataset = sanityClient.config().dataset;

    if (projectId && dataset) {
        try {
            const tempUrl = urlFor(imageAsset as SanityImageSource)?.width(1000)?.fit('max')?.url();
            if (tempUrl) {
                imageUrl = tempUrl;
            } else {
                const assetRef = imageAsset._ref;
                if (assetRef && typeof assetRef === 'string') {
                    const parts = assetRef.replace('image-', '').split('-');
                    if (parts.length >= 3) {
                        imageUrl = `https://cdn.sanity.io/images/${projectId}/${dataset}/${parts[0]}-${parts[1]}.${parts[2]}`;
                    }
                }
            }
        } catch (e) {
            console.warn("Ошибка при обработке изображения:", e);
        }
    }
  }

  const displayTitle = post.title ?? 'Без заголовка';
  const imageAlt = post.mainImage?.alt || displayTitle || 'Изображение новости';

  return (
    <article className={singlePostStyles.articleContainer}>
      <header className={singlePostStyles.articleHeader}>
        <h1 className={singlePostStyles.title}>{displayTitle}</h1>
        {post.publishedAt && (
          <p className={singlePostStyles.date}>
            {new Date(post.publishedAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </header>

      {imageUrl ? (
        <div className={singlePostStyles.imageWrapper}>
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={1000}
            height={562}
            priority
            className={singlePostStyles.image}
            sizes="(max-width: 1024px) 100vw, 1000px"
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : post.mainImage?.asset && (
        <div className={singlePostStyles.imageWrapper}>
            <p>Не удалось загрузить изображение для новости.</p>
        </div>
      )}

      {post.body ? (
        <div className={singlePostStyles.bodyContent}>
          <PortableText value={post.body} />
        </div>
      ) : (
        <p className={singlePostStyles.noContentMessage}>Содержимое новости отсутствует.</p>
      )}

      <div className={singlePostStyles.backLinkWrapper}>
        <Link href="/news" className={singlePostStyles.backLink}>
          ← Назад ко всем новостям
        </Link>
      </div>
    </article>
  );
}