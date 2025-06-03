// src/app/catalog/ClientCatalogContent.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './catalog.module.css';
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

interface ClientCatalogContentProps {
  categoryDisplayNames: Record<string, string>;
}

export default function ClientCatalogContent({ categoryDisplayNames }: ClientCatalogContentProps) {
  const searchParams = useSearchParams(); // Вызываем хук 

  const [allEquipmentSanityItems, setAllEquipmentSanityItems] = useState<EquipmentItemSanity[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Изначально true
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // selectedType будет инициализирован на основе URL в useEffect 
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Эффект для установки selectedType из URL 
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    console.log('CATALOG: useEffect [searchParams] triggered. typeFromUrl:', typeFromUrl);
    setSelectedType(typeFromUrl || 'all'); // Устанавливаем или сбрасываем на 'all'
  }, [searchParams]); 

  // Эффект для загрузки данных
  const fetchEquipment = useCallback(async () => {
    if (!sanityClient) {
      setFetchError("Клиент Sanity не инициализирован.");
      setIsLoading(false); // Убедимся, что isLoading сбрасывается
      return;
    }
    setFetchError(null);
    console.log("CATALOG: Fetching equipment data START...");
    try {
      const sanityData: EquipmentItemSanity[] = await sanityClient.fetch(equipmentQuery);
      console.log("CATALOG: Equipment data FETCHED:", sanityData.length, "items");
      setAllEquipmentSanityItems(sanityData);
    } catch (errFromCatch: unknown) {
      console.error("CATALOG: Ошибка загрузки техники из Sanity:", errFromCatch);
      const message = errFromCatch instanceof Error ? errFromCatch.message : "Неизвестная ошибка.";
      setFetchError(`Не удалось загрузить каталог техники: ${message}`);
    } finally {
      setIsLoading(false); // Устанавливаем isLoading в false 
      console.log("CATALOG: Fetching equipment FINISHED, isLoading:", false);
    }
  }, []); // Зависимостей нет

  useEffect(() => {
    console.log("CATALOG: useEffect to call fetchEquipment (initial load)");
    setIsLoading(true); // Устанавливаем isLoading в true ПЕРЕД вызовом fetchEquipment
    fetchEquipment();
  }, [fetchEquipment]); // Этот эффект запустит загрузку данных 


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
  }, [allEquipmentSanityItems, categoryDisplayNames]);

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
  }, [allItemsForCard, categoryDisplayNames]);

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

  const iconStyle = {
    width: '20px',
    height: '20px',
    marginRight: '8px',
    display: 'inline-block',
    verticalAlign: 'middle',
  };

  console.log("CATALOG: Rendering component. isLoading:", isLoading, "fetchError:", fetchError, "filteredItems.length:", filteredItems.length, "selectedType:", selectedType);

  if (isLoading) { // Показываем индикатор, пока isLoading === true
    console.log("CATALOG: Rendering loading indicator because isLoading is true.");
    return <div className={styles.loadingIndicator}></div>;
  }

  if (fetchError) {
    console.log("CATALOG: Rendering fetch error:", fetchError);
    return <p className={styles.errorIndicator}>{fetchError}</p>;
  }

  // Если не isLoading и нет fetchError, показываем контент или "нет результатов"
  return (
    <>
      <div className={styles.filtersContainer}>
        {/* (JSX для фильтров остается здесь, он должен работать с обновленным selectedType) */}
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
    </>
  );
}