// src/app/catalog/page.tsx (Полный код БЕЗ ВНЕШНИХ АНИМАЦИЙ FRAMER MOTION)
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import styles from './catalog.module.css';
import EquipmentCard from '@/components/EquipmentCard'; // Убедитесь, что этот путь правильный
import { sanityClient } from '@/lib/sanityClient';
import { groq } from 'next-sanity';
// Убраны импорты framer-motion
// import { motion, AnimatePresence } from 'framer-motion';
import type { EquipmentCardData, EquipmentItemSanity } from '@/types/equipment'; // Убедитесь, что путь к типам верный
import { FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Запрос GROQ (убедитесь, что поля существуют в вашей схеме)
const equipmentQuery = groq`*[_type == "equipment" && defined(slug.current)] | order(name asc) {
  _id,
  name,
  slug,
  category, // Имя поля в Sanity
  brand,
  excerpt,  // Имя поля в Sanity
  mainImage {
    asset,
    alt
  },
  status
}`;

// Отображаемые имена категорий
const categoryDisplayNames: Record<string, string> = {
  'wheeled-excavator': 'Колесные экскаваторы',
  'tracked-excavator': 'Гусеничные экскаваторы',
  'loader': 'Погрузчики',
  'dump-truck': 'Самосвалы',
};

// Анимации были здесь, но удалены для теста
// const staggerContainer = { ... };
// const baseFadeInUp = { ... };

export default function CatalogPage() {
  const [allEquipmentSanityItems, setAllEquipmentSanityItems] = useState<EquipmentItemSanity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!sanityClient) { setError("Клиент Sanity не инициализирован."); setLoading(false); return; }
      setLoading(true); setError(null);
      try {
        const sanityData: EquipmentItemSanity[] = await sanityClient.fetch(equipmentQuery);
        setAllEquipmentSanityItems(sanityData);
      } catch (errFromCatch: unknown) {
        console.error("Ошибка загрузки техники из Sanity:", errFromCatch);
        const message = errFromCatch instanceof Error ? errFromCatch.message : "Неизвестная ошибка.";
        setError(`Не удалось загрузить каталог техники: ${message}`);
      } finally { setLoading(false); }
    };
    fetchEquipment();
  }, []);

  // Маппинг данных Sanity в тип EquipmentCardData
  const allItemsForCard: EquipmentCardData[] = useMemo(() => {
      return allEquipmentSanityItems.map(item => ({
          id: item._id,
          name: item.name ?? 'Без названия',
          category: item.category ? categoryDisplayNames[item.category] ?? item.category : 'Без категории',
          categoryValue: item.category ?? 'all',
          brand: item.brand ?? 'Unknown',
          image: item.mainImage ?? null,
          link: item.slug?.current ? `/catalog/${item.slug.current}` : '#',
          excerpt: item.excerpt ?? undefined,
          status: item.status ?? undefined,
      }));
  }, [allEquipmentSanityItems]);

  // Генерация фильтров
  const availableBrands = useMemo(() => { const brands = new Set(allItemsForCard.map(item => item.brand).filter((b): b is string => !!b && b !== 'Unknown')); return ['all', ...Array.from(brands).sort()]; }, [allItemsForCard]);
  const availableTypes = useMemo(() => { const typesSet = new Set(allItemsForCard.map(item => item.categoryValue).filter((v): v is string => !!v)); const typesArray = Array.from(typesSet); const displayTypes = typesArray.filter(value => value !== 'all').map(value => ({ value: value, title: categoryDisplayNames[value] ?? value })).sort((a, b) => a.title.localeCompare(b.title)); return [{ value: 'all', title: 'Все типы' }, ...displayTypes]; }, [allItemsForCard]);

  // Логика фильтрации
  const filteredItems = useMemo(() => { return allItemsForCard.filter(item => (selectedType === 'all' || item.categoryValue === selectedType) && (selectedBrand === 'all' || item.brand === selectedBrand)); }, [selectedType, selectedBrand, allItemsForCard]);
  const resetFilters = () => { setSelectedType('all'); setSelectedBrand('all'); };
  const areFiltersActive = selectedType !== 'all' || selectedBrand !== 'all';

  return (
    // Используем обычный div вместо motion.div
    <div className={styles.catalogPageContainer}>
      {/* Заголовок без анимации */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Каталог <span className={styles.titleHighlight}>спецтехники</span></h1>
        <p className={styles.pageSubtitle}>Выберите необходимую технику из нашего широкого ассортимента.</p>
      </div>

      {error && <p className={styles.errorIndicator}>{error}</p>}

      {/* Блок Фильтров без анимации */}
      {!loading && !error && (
        // Используем обычный div вместо motion.div
        <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
                <label htmlFor="type-filter" className={styles.filterLabel}><FunnelIcon /> Тип техники:</label>
                <div className={styles.filterButtons}>
                    {availableTypes.map(type => ( <button key={type.value} id="type-filter" onClick={() => setSelectedType(type.value)} className={`${styles.filterButton} ${selectedType === type.value ? styles.activeFilter : ''}`}> {type.title} </button> ))}
                </div>
            </div>
            <div className={styles.filterGroup}>
                <label htmlFor="brand-filter" className={styles.filterLabel}><FunnelIcon /> Производитель:</label>
                <div className={styles.filterButtons}>
                    {availableBrands.map(brand => ( <button key={brand} id="brand-filter" onClick={() => setSelectedBrand(brand)} className={`${styles.filterButton} ${selectedBrand === brand ? styles.activeFilter : ''}`}> {brand === 'all' ? 'Все бренды' : brand} </button>))}
                </div>
            </div>
            {areFiltersActive && ( <button onClick={resetFilters} className={styles.resetButton}><ArrowPathIcon /> Сбросить фильтры</button> )}
        </div>
      )}

      {/* Индикатор загрузки */}
      {loading && <div className={styles.loadingIndicator}></div>}

      {/* Сетка каталога без анимации */}
      {!loading && !error && (
          // Используем обычный div вместо motion.div и убираем AnimatePresence
          <div className={styles.equipmentGrid}>
            {filteredItems.length > 0 ? (
                // Внутри компонента EquipmentCard могут быть свои анимации, они остаются
                filteredItems.map((itemData) => (
                  <EquipmentCard key={itemData.id} item={itemData} />
                ))
              ) : (
                 <div className={styles.noResults}>
                    <p>По вашему запросу техника не найдена.</p>
                    <p>Попробуйте изменить фильтры или сбросить их.</p>
                 </div>
              )
            }
          </div>
      )}
    </div>
  );
}