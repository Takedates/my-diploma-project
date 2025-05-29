// src/app/catalog/page.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './catalog.module.css'; // Убедись, что этот файл существует и содержит ВАШИ стили для каталога
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
  const initialTypeFromUrl = searchParams.get('type');

  const [allEquipmentSanityItems, setAllEquipmentSanityItems] = useState<EquipmentItemSanity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>(initialTypeFromUrl || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl) {
      setSelectedType(typeFromUrl);
    }
    // Если нужно сбрасывать на 'all' при отсутствии параметра в URL
    // else if (!initialTypeFromUrl) { // Чтобы не сбрасывать при каждом ререндере без параметра
    //   setSelectedType('all');
    // }
  }, [searchParams, initialTypeFromUrl]); // Добавил initialTypeFromUrl для более точной реакции

  const fetchEquipment = useCallback(async () => {
    if (!sanityClient) {
      setFetchError("Клиент Sanity не инициализирован.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setFetchError(null);
    // setAllEquipmentSanityItems([]); // Можно не очищать, чтобы не было "моргания", если данные уже есть
    try {
      const sanityData: EquipmentItemSanity[] = await sanityClient.fetch(equipmentQuery);
      setAllEquipmentSanityItems(sanityData);
    } catch (errFromCatch: unknown) {
      console.error("Ошибка загрузки техники из Sanity:", errFromCatch);
      const message = errFromCatch instanceof Error ? errFromCatch.message : "Неизвестная ошибка.";
      setFetchError(`Не удалось загрузить каталог техники: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [equipmentQuery]); // sanityClient обычно стабилен, equipmentQuery тоже

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
    const typesSet = new Set(allItemsForCard.map(item => item.categoryValue).filter((v): v is string => !!v && v !== ''));
    const typesArray = Array.from(typesSet);
    const displayTypes = typesArray
      .filter(value => value !== 'all')
      .map(value => ({ value: value, title: categoryDisplayNames[value] ?? value }))
      .sort((a, b) => a.title.localeCompare(b.title));
    return [{ value: 'all', title: 'Все типы' }, ...displayTypes];
  }, [allItemsForCard]);

  const filteredItems = useMemo(() => {
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

  const iconStyle = { // Инлайн стили для иконок, если CSS-модули или Tailwind не справляются
    width: '20px',
    height: '20px',
    marginRight: '8px',
    display: 'inline-block',
    verticalAlign: 'middle',
  };

  if (isLoading && allEquipmentSanityItems.length === 0) { // Показываем лоадер только при первой загрузке
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
              <label className={styles.filterLabel}><FunnelIcon style={iconStyle} /> Тип техники:</label>
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
              <label className={styles.filterLabel}><FunnelIcon style={iconStyle} /> Производитель:</label>
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
              <ArrowPathIcon style={{...iconStyle, marginRight: '4px'}} /> Сбросить фильтры
            </button>
          )}
      </div>

      {isLoading && allEquipmentSanityItems.length > 0 && ( // Показываем полупрозрачный лоадер поверх контента при перезагрузке/фильтрации
        <div className={styles.overlayLoadingIndicator}>Обновление...</div>
      )}

      <div className={styles.equipmentGrid}>
        {/* Даже если filteredItems пуст, но нет isLoading и fetchError, показываем сообщение "нет результатов" */}
        {(filteredItems.length > 0 || (!isLoading && !fetchError)) ? (
            filteredItems.length > 0 ? (
                filteredItems.map((itemData) => (
                <EquipmentCard key={itemData.id} item={itemData} />
                ))
            ) : (
                <div className={styles.noResults}>
                    <p>По вашему запросу техника не найдена.</p>
                    <p>Попробуйте изменить фильтры или сбросить их.</p>
                </div>
            )
          ) : null // Если isLoading или fetchError, то эти состояния уже обработаны выше
        }
      </div>
    </div>
  );
}