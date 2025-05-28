// src/app/catalog/page.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './catalog.module.css'; // Убедитесь, что этот файл существует и содержит ВАШИ стили для каталога
import EquipmentCard from '@/components/EquipmentCard';
import { sanityClient } from '@/lib/sanityClient';
import { groq } from 'next-sanity';
import type { EquipmentCardData, EquipmentItemSanity } from '@/types/equipment';
import { FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const equipmentQuery = groq`*[_type == "equipment" && defined(slug.current)] | order(name asc) {
  _id,
  name,
  slug,
  category,
  brand,
  excerpt,
  mainImage {
    asset,
    alt
  },
  status
}`;

const categoryDisplayNames: Record<string, string> = {
  'wheeled-excavator': 'Колесные экскаваторы',
  'tracked-excavator': 'Гусеничные экскаваторы',
  'loader': 'Погрузчики',
  'dump-truck': 'Самосвалы',
};

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const [allEquipmentSanityItems, setAllEquipmentSanityItems] = useState<EquipmentItemSanity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const initialTypeFromUrl = searchParams.get('type');
  const [selectedType, setSelectedType] = useState<string>(initialTypeFromUrl || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  const fetchEquipment = useCallback(async () => {
    if (!sanityClient) {
      setFetchError("Клиент Sanity не инициализирован.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setFetchError(null);
    try {
      // console.log("Fetching equipment data..."); // Оставим закомментированным пока
      const sanityData: EquipmentItemSanity[] = await sanityClient.fetch(equipmentQuery);
      // console.log("Equipment data fetched:", sanityData.length, "items");
      setAllEquipmentSanityItems(sanityData);
    } catch (errFromCatch: unknown) {
      console.error("Ошибка загрузки техники из Sanity:", errFromCatch);
      const message = errFromCatch instanceof Error ? errFromCatch.message : "Неизвестная ошибка.";
      setFetchError(`Не удалось загрузить каталог техники: ${message}`);
    } finally {
      setIsLoading(false);
      // console.log("Fetching finished, isLoading:", false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

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

  const availableBrands = useMemo(() => {
    const brands = new Set(allItemsForCard.map(item => item.brand).filter((b): b is string => !!b && b !== 'Unknown'));
    return ['all', ...Array.from(brands).sort()];
  }, [allItemsForCard]);

  const availableTypes = useMemo(() => {
    const typesSet = new Set(allItemsForCard.map(item => item.categoryValue).filter((v): v is string => !!v));
    const typesArray = Array.from(typesSet);
    const displayTypes = typesArray
      .filter(value => value !== 'all' && value !== '')
      .map(value => ({ value: value, title: categoryDisplayNames[value] ?? value }))
      .sort((a, b) => a.title.localeCompare(b.title));
    return [{ value: 'all', title: 'Все типы' }, ...displayTypes];
  }, [allItemsForCard]);

  const filteredItems = useMemo(() => {
    // console.log("Filtering items. SelectedType:", selectedType, "SelectedBrand:", selectedBrand);
    return allItemsForCard.filter(item =>
      (selectedType === 'all' || item.categoryValue === selectedType) &&
      (selectedBrand === 'all' || item.brand === selectedBrand)
    );
  }, [selectedType, selectedBrand, allItemsForCard]);

  const resetFilters = () => {
    setSelectedType('all');
    setSelectedBrand('all');
  };

  const areFiltersActive = selectedType !== 'all' || selectedBrand !== 'all';

  if (isLoading) {
    return (
      <div className={styles.catalogPageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Каталог <span className={styles.titleHighlight}>спецтехники</span></h1>
          <p className={styles.pageSubtitle}>Выберите необходимую технику из нашего широкого ассортимента.</p>
        </div>
        <div className={styles.loadingIndicator}></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={styles.catalogPageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Каталог <span className={styles.titleHighlight}>спецтехники</span></h1>
          <p className={styles.pageSubtitle}>Выберите необходимую технику из нашего широкого ассортимента.</p>
        </div>
        <p className={styles.errorIndicator}>{fetchError}</p>
      </div>
    );
  }

  return (
    <div className={styles.catalogPageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Каталог <span className={styles.titleHighlight}>спецтехники</span></h1>
        <p className={styles.pageSubtitle}>Выберите необходимую технику из нашего широкого ассортимента.</p>
      </div>

      <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
              {/* ВАЖНО: Здесь вы должны использовать свой класс из catalog.module.css для иконки, если он есть,
                  или оставить так, если Tailwind должен был их стилизовать,
                  или использовать инлайн-стили, как мы пробовали */}
              <label className={styles.filterLabel}><FunnelIcon className={styles.filterIcon} /> Тип техники:</label>
              <div className={styles.filterButtons}>
                  {availableTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`${styles.filterButton} ${selectedType === type.value ? styles.activeFilter : ''}`}
                    >
                      {type.title}
                    </button>
                  ))}
              </div>
          </div>
          <div className={styles.filterGroup}>
              <label className={styles.filterLabel}><FunnelIcon className={styles.filterIcon} /> Производитель:</label>
              <div className={styles.filterButtons}>
                  {availableBrands.map(brand => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`${styles.filterButton} ${selectedBrand === brand ? styles.activeFilter : ''}`}
                    >
                      {brand === 'all' ? 'Все бренды' : brand}
                    </button>
                  ))}
              </div>
          </div>
          {areFiltersActive && (
            <button onClick={resetFilters} className={styles.resetButton}>
              <ArrowPathIcon className={styles.resetIcon} /> Сбросить фильтры
            </button>
          )}
      </div>

      <div className={styles.equipmentGrid}>
        {filteredItems.length > 0 ? (
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
    </div>
  );
}