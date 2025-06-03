'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './news.module.css';
import { urlFor } from '@/lib/sanityClient';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { motion } from 'framer-motion'; 
import { ArrowRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

// Тип данных для пропсов
interface NewsPostSanity {
  _id: string;
  title?: string | null;
  slug?: { current?: string | null } | null;
  publishedAt?: string | null;
  excerpt?: string | null;
  mainImage?: { asset?: SanityImageSource | null; alt?: string | null } | null;
}

interface NewsListClientProps {
  newsItems: NewsPostSanity[];
  fetchError: string | null;
}

// Анимации
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};
const staggerContainer = { 
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
};

// ПУТИ К ПЛЕЙСХОЛДЕРАМ
const PLACEHOLDER_FEATURED_NEWS_IMAGE = '/images/placeholder-news-featured.jpg';
const PLACEHOLDER_NEWS_CARD_IMAGE = '/images/placeholder-news-card.jpg';

export default function NewsListClient({ newsItems, fetchError }: NewsListClientProps) {
  const featuredNews = newsItems.length > 0 ? newsItems[0] : null;
  const latestNews = newsItems.length > 1 ? newsItems.slice(1) : (newsItems.length === 1 ? [] : []);

  const featuredSlug = featuredNews?.slug?.current;
  const featuredImageAsset = featuredNews?.mainImage?.asset;
  const featuredImageUrlString = featuredImageAsset
    ? urlFor(featuredImageAsset)?.width(1000).height(625).fit('crop').url()
    : undefined;

  // Функция formatDate теперь используется
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Дата не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Более краткий формат даты для карточек "Другие новости"
  const formatCardDate = (dateString?: string | null) => {
    if (!dateString) return 'Дата не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
  };


  if (fetchError) {
    return <div className={styles.errorMessage}>{fetchError}</div>;
  }

  if (newsItems.length === 0 && !fetchError) {
      return <p className={styles.noNewsMessage}>Новостей пока нет. Следите за обновлениями!</p>;
  }

  return (
    <div className={styles.newsPageContainer}>
      <motion.div
        className={styles.pageHeader}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h1 className={styles.pageTitle}>
          Новости <span className={styles.titleHighlight}>Компании</span>
        </h1>
        <p className={styles.introText}>
          Самые свежие события, аналитика рынка и полезная информация из мира спецтехники.
        </p>
      </motion.div>

      {/* --- Секция Горячая новость (Featured) --- */}
      {featuredNews && featuredSlug && (
        <motion.section
          className={styles.featuredNewsWrapper}
          initial="hidden" animate="visible" variants={fadeInUp} transition={{delay: 0.2}}
        >
          <Link href={`/news/${featuredSlug}`} className={styles.featuredCard}>
            <div className={styles.featuredImageContainer}>
              <Image
                src={featuredImageUrlString || PLACEHOLDER_FEATURED_NEWS_IMAGE}
                alt={featuredNews.mainImage?.alt || featuredNews.title || 'Главная новость'}
                fill
                className={styles.featuredImage}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 700px"
                priority
              />
            </div>
            <div className={styles.featuredContent}>
              <div>
                <span className={styles.featuredTag}>Главная новость</span>
                <h2 className={styles.featuredTitle}>{featuredNews.title}</h2>
                {featuredNews.excerpt && (
                  <p className={styles.featuredExcerpt}>
                    {featuredNews.excerpt}
                  </p>
                )}
              </div>
              <div className={styles.featuredMeta}>
                <div className={styles.featuredDate}>
                  <CalendarDaysIcon className={styles.metaIcon} />
                  {/* ИСПОЛЬЗУЕМ formatDate */}
                  <span>{formatDate(featuredNews.publishedAt)}</span>
                </div>
                <div className={styles.featuredReadMore}>
                  <span>Читать далее</span>
                  <ArrowRightIcon className={styles.metaIcon} />
                </div>
              </div>
            </div>
          </Link>
        </motion.section>
      )}
      {/* --- Конец Featured --- */}

      {/* --- Секция Последние новости (Сетка) --- */}
      {latestNews.length > 0 && (
        <section className={styles.latestNewsSection}>
           <motion.h2
             className={styles.sectionTitleAlt}
             initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}
           >
             {featuredNews ? 'Другие Новости' : 'Последние Новости'}
           </motion.h2>
           <motion.div
             className={styles.latestGrid}
             variants={staggerContainer}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, amount: 0.1 }}
           >
             {latestNews.map((post) => {
                 const postSlug = post?.slug?.current;
                 const imageAsset = post?.mainImage?.asset;
                 const imageUrlFromSanity = imageAsset
                    ? urlFor(imageAsset)?.width(600).height(400).fit('crop').url()
                    : undefined;

                 if (!postSlug || !post.title) return null;

                 return (
                   <Link key={post._id} href={`/news/${postSlug}`} className={styles.latestCardLink}>
                     <motion.article className={styles.latestCard} variants={fadeInUp}>
                       <div className={styles.latestImageWrapper}>
                         <Image
                           src={imageUrlFromSanity || PLACEHOLDER_NEWS_CARD_IMAGE}
                           alt={post.mainImage?.alt || post.title || 'Новость'}
                           fill
                           className={styles.latestImage}
                           sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                         />
                       </div>
                       <div className={styles.latestContent}>
                         <h3 className={styles.latestTitle}>{post.title}</h3>
                         <div className={styles.latestCardMeta}>
                             <span className={styles.latestDate}>
                               <CalendarDaysIcon className={styles.metaIconSmall} />
                               {/* formatCardDate */}
                               {formatCardDate(post.publishedAt)}
                             </span>
                             <span className={styles.latestReadArrow}>
                                 <ArrowRightIcon className={styles.metaIconSmall}/>
                             </span>
                         </div>
                       </div>
                     </motion.article>
                   </Link>
                 );
             })}
           </motion.div>
        </section>
      )}
    </div>
  );
}