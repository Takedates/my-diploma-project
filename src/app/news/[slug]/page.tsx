// src/app/news/[slug]/page.tsx (Исправлена ошибка 'Object is possibly null' для title)
import React from 'react';
import { sanityClient, urlFor } from '@/lib/sanityClient';
import { groq } from 'next-sanity';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
// Стили
import commonStyles from '../news.module.css';
import singlePostStyles from './singlePost.module.css';
import Link from 'next/link';
// Типы
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import type { PortableTextBlock } from '@portabletext/types';

// Тип для полной новости
interface FullNewsPost {
  _id: string;
  title?: string | null;
  publishedAt?: string | null;
  mainImage?: { asset?: SanityImageSource | null; alt?: string | null } | null;
  body?: PortableTextBlock[] | null;
}

// Тип для параметров страницы
interface PageProps {
  params: { slug: string };
}

// Запрос GROQ
const singleNewsQuery = groq`*[_type == "newsPost" && slug.current == $slug][0] {
  _id, title, publishedAt, mainImage { asset, alt }, body
}`;

// Асинхронный компонент страницы
export default async function SingleNewsPage({ params }: PageProps) {
  const slug = params.slug;

  let post: FullNewsPost | null = null;
  let fetchError: string | null = null;

  if (!sanityClient) {
    console.error("Sanity client is not configured.");
    fetchError = "Ошибка конфигурации Sanity.";
  } else {
    try {
      post = await sanityClient.fetch<FullNewsPost | null>(singleNewsQuery, { slug });
    } catch (error: unknown) {
      console.error("Ошибка загрузки новости:", error);
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      fetchError = `Не удалось загрузить новость: ${message}`;
    }
  }

  // --- Обработка ошибок и случая "не найдено" ---
  if (fetchError || !post) {
     // --- Определяем заголовок и текст для сообщения об ошибке ---
     const errorTitle = fetchError ? 'Ошибка загрузки' : 'Новость не найдена';
     const errorMessage = fetchError ?? 'К сожалению, новость с таким адресом не существует.';
     // -------------------------------------------------------------
     return (
       <div className={singlePostStyles.messageContainer}>
         <h1 className={commonStyles?.pageTitle ?? singlePostStyles.title}>
             {errorTitle}
         </h1>
         <p>{errorMessage}</p>
         <Link href="/news" className={singlePostStyles.backLink} style={{marginTop: '2rem'}}>
           ← Назад ко всем новостям
         </Link>
       </div>
     );
  }
  // --- Конец обработки ошибок ---

  // --- Получаем значения с проверками и запасными вариантами ---
  const imageAsset = post.mainImage?.asset;
  const imageUrl = imageAsset ? urlFor(imageAsset).width(1000).fit('max').url() : null;
  const displayTitle = post.title ?? 'Без заголовка'; // <-- Запасной вариант для заголовка
  const imageAlt = post.mainImage?.alt || displayTitle || 'Изображение новости'; // <-- Используем displayTitle здесь
  // -----------------------------------------------------------

  return (
    <article className={singlePostStyles.articleContainer}>
      <header className={singlePostStyles.articleHeader}>
        {/* Используем переменную displayTitle */}
        <h1 className={singlePostStyles.title}>{displayTitle}</h1>
        {post.publishedAt && (
          <p className={singlePostStyles.date}>
            {new Date(post.publishedAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </header>

      {imageUrl && (
        <div className={singlePostStyles.imageWrapper}>
          <Image
            src={imageUrl}
            alt={imageAlt} // Используем imageAlt
            width={1000}
            height={562}
            priority
            className={singlePostStyles.image}
            sizes="(max-width: 1024px) 100vw, 1000px"
          />
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