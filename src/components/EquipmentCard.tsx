// src/components/EquipmentCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './EquipmentCard.module.css';
import { urlFor } from '@/lib/sanityClient';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { EquipmentCardData } from '@/types/equipment';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface EquipmentCardProps {
  item: EquipmentCardData;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  hover: {
    y: -6,
    boxShadow: "0 10px 20px -5px rgb(0 0 0 / 0.1), 0 6px 10px -6px rgb(0 0 0 / 0.1)",
    transition: { duration: 0.25, ease: 'easeOut' }
  }
};

export default function EquipmentCard({ item }: EquipmentCardProps) {
  const imageAsset = item.image?.asset;
  let imageUrl = '/images/placeholder-equipment.jpg';

  if (imageAsset) {
    try {
      const processedUrl = urlFor(imageAsset as SanityImageSource)
        ?.width(400)
        ?.height(300)
        ?.fit('crop')
        ?.auto('format')
        ?.url();

      if (processedUrl) {
        imageUrl = processedUrl;
      } else {
        console.warn("urlFor не смог сформировать валидный URL для imageAsset в EquipmentCard:", imageAsset);
      }
    } catch (error) {
      console.error("Ошибка при вызове urlFor в EquipmentCard:", error, "Элемент:", item);
    }
  }

  const linkHref = item.link || '#'; // Используем || '#' для безопасности, если link не придет

  let statusClass = styles.defaultStatus;
  if (item.status) {
    const statusNormalized = item.status.toLowerCase().replace(/\s+/g, '-');
    if (styles[statusNormalized]) {
        statusClass = styles[statusNormalized];
    } else {
        const lowerStatus = item.status.toLowerCase();
        if (lowerStatus.includes('наличии')) { statusClass = styles.inStock; }
        else if (lowerStatus.includes('заказ')) { statusClass = styles.onOrder; }
        else if (lowerStatus.includes('продан')) { statusClass = styles.soldOut; }
    }
  }

  return (
    <motion.div
      className={styles.cardWrapper} // ИЗМЕНЕНО: просто обертка, не ссылка
      variants={cardVariants}
      whileHover="hover"
      layout
    >
      {/* <div className={styles.card}> УБРАЛИ Link отсюда, styles.card теперь для внутреннего div */}
      <div className={styles.card}> {/* Этот div теперь не ссылка */}
        <div className={styles.imageWrapper}>
          <Link href={linkHref}> {/* ССЫЛКА НА ИЗОБРАЖЕНИИ */}
            <Image
              src={imageUrl}
              alt={item.image?.alt || item.name || 'Фото техники'}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={styles.image}
            />
          </Link>
          {item.status && (
            <span className={`${styles.statusBadge} ${statusClass}`}>
                {item.status}
            </span>
          )}
        </div>
        <div className={styles.content}>
          {(item.category && item.category !== 'Без категории') && (
            <p className={styles.type}>{item.category} ({item.brand})</p>
          )}
          {(!item.category || item.category === 'Без категории') && item.brand !== 'Unknown' && (
             <p className={styles.type}>{item.brand}</p>
          )}
          {/* ССЫЛКА НА ЗАГОЛОВКЕ */}
          <Link href={linkHref} className={styles.titleLink}>
            <h3 className={styles.title}>{item.name}</h3>
          </Link>
          {item.excerpt && (
            <p className={styles.description}>
              {item.excerpt.length > 120 ? item.excerpt.substring(0, 117) + '...' : item.excerpt}
            </p>
          )}
          <div className={styles.cardFooter}>
            {/* ССЫЛКА-КНОПКА "ПОДРОБНЕЕ" */}
            <Link href={linkHref} className={styles.detailsButton}>
                Подробнее <ArrowRightIcon className={styles.arrowIcon} /> {/* Добавил класс для иконки */}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}