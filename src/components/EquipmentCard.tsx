// src/components/EquipmentCard/EquipmentCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './EquipmentCard.module.css';
import { urlFor } from '@/lib/sanityClient';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { EquipmentCardData } from '@/types/equipment';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface EquipmentCardProps {
  item: EquipmentCardData;
}


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

  const linkHref = item.link || '#'; 

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

    <div
      className={styles.cardWrapper} 
    >
      <div className={styles.card}> 
        <div className={styles.imageWrapper}>
          <Link href={linkHref}>
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
          <Link href={linkHref} className={styles.titleLink}>
            <h3 className={styles.title}>{item.name}</h3>
          </Link>
          {item.excerpt && (
            <p className={styles.description}>
              {item.excerpt.length > 120 ? item.excerpt.substring(0, 117) + '...' : item.excerpt}
            </p>
          )}
          <div className={styles.cardFooter}>
            <Link href={linkHref} className={styles.detailsButton}>
                Подробнее <ArrowRightIcon className={styles.arrowIcon} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}