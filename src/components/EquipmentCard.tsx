// src/components/EquipmentCard.tsx (Полный код, использующий EquipmentCardData)
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './EquipmentCard.module.css'; // Путь к вашим стилям карточки
import { urlFor } from '@/lib/sanityClient'; // Импортируем urlFor для обработки изображений
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
// Импортируем ЕДИНЫЙ тип данных для карточки
import type { EquipmentCardData } from '@/types/equipment'; // Убедитесь, что путь к типам верный

// Определяем интерфейс для пропсов компонента
interface EquipmentCardProps {
  item: EquipmentCardData; // Ожидаем проп 'item' типа EquipmentCardData
}

// Анимация для карточки (определяем здесь или импортируем)
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  // visible убран, так как анимация будет управляться staggerChildren из родителя
  // или можно оставить, если рендерить без stagger:
  // visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  hover: {
    y: -6,
    boxShadow: "0 10px 20px -5px rgb(0 0 0 / 0.1), 0 6px 10px -6px rgb(0 0 0 / 0.1)",
    transition: { duration: 0.25, ease: 'easeOut' }
  }
};

export default function EquipmentCard({ item }: EquipmentCardProps) {
  // Получаем URL изображения из item.image (которое содержит mainImage из Sanity)
  const imageAsset = item.image?.asset;
  const imageUrl = imageAsset
    ? urlFor(imageAsset).width(400).height(300).fit('crop').auto('format').url() // Добавили auto('format')
    : '/images/placeholder-equipment.jpg'; // Запасное изображение - убедитесь, что оно есть

  // Используем item.link для ссылки
  const linkHref = item.link;

  // Определяем класс для статуса
  let statusClass = styles.defaultStatus;
  if (item.status) {
    const statusNormalized = item.status.toLowerCase().replace(/\s+/g, '-');
    if (styles[statusNormalized]) {
        statusClass = styles[statusNormalized];
    } else {
        // Запасная логика по ключевым словам
        const lowerStatus = item.status.toLowerCase();
        if (lowerStatus.includes('наличии')) { statusClass = styles.inStock; }
        else if (lowerStatus.includes('заказ')) { statusClass = styles.onOrder; }
        else if (lowerStatus.includes('продан')) { statusClass = styles.soldOut; }
    }
  }

  return (
    // Обертка для анимации и стилей hover всей карточки
    <motion.div
      className={styles.cardLinkWrapper}
      variants={cardVariants}
      // initial="hidden" // Управляется родителем через staggerContainer
      // animate="visible" // Управляется родителем через staggerContainer
      whileHover="hover" // Активируем hover-вариант
      layout // Плавная анимация при фильтрации/сортировке
    >
      {/* Ссылка оборачивает все содержимое карточки */}
      <Link href={linkHref} className={styles.card}>
        {/* Контейнер для изображения */}
        <div className={styles.imageWrapper}>
          <Image
            src={imageUrl}
            alt={item.image?.alt || item.name || 'Фото техники'} // Используем alt из item.image
            fill // Заполняет родительский div (.imageWrapper)
            style={{ objectFit: 'cover' }} // Масштабирует с обрезкой
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // Подсказка для браузера по размерам
            className={styles.image} // Стили для самого тега img (если нужны, например, transition)
          />
          {/* Отображаем статус, если он есть */}
          {item.status && (
            <span className={`${styles.statusBadge} ${statusClass}`}>
                {item.status}
            </span>
          )}
        </div>
        {/* Контейнер для текстового контента */}
        <div className={styles.content}>
          {/* Отображаем категорию (тип) и бренд */}
          {(item.category && item.category !== 'Без категории') && (
            <p className={styles.type}>{item.category} ({item.brand})</p>
          )}
          {/* Если категории нет, но есть бренд */}
          {(!item.category || item.category === 'Без категории') && item.brand !== 'Unknown' && (
             <p className={styles.type}>{item.brand}</p>
          )}

          {/* Название техники */}
          <h3 className={styles.title}>{item.name}</h3>

          {/* Отображаем описание (excerpt) */}
          {item.excerpt && (
            <p className={styles.description}>
              {/* Обрезаем текст, если он слишком длинный (хотя CSS это уже делает) */}
              {item.excerpt.length > 120 ? item.excerpt.substring(0, 117) + '...' : item.excerpt}
            </p>
          )}
          {/* Футер карточки */}
          <div className={styles.cardFooter}>
            {/* Цена (если будет нужна) */}
            {/* <span className={styles.pricePlaceholder}>Цена по запросу</span> */}
            {/* Кнопка "Подробнее" */}
            <div className={styles.detailsButton}>
                Подробнее <ArrowRightIcon />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}