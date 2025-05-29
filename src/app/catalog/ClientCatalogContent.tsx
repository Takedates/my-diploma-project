// src/app/catalog/ClientCatalogContent.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './catalog.module.css'; // Убедитесь, что этот файл существует и стили корректны
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
  const searchParams = useSearchParams();
  const initialTypeFromUrl = searchParams.get('type');
  console.log('ClientCatalogContent MOUNTED. Initial type from URL:', initialTypeFromUrl); // <-- ЛОГ 1

  const [allEquipmentSanityItems, setAllEquipmentSanityItems] = useState<EquipmentItemSanity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Начинаем с 'all', потом useEffect обновит на основе URL
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    console.log('CATALOG: useEffect [searchParams] triggered. typeFromUrl:', typeFromUrl, 'Current selectedType:', selectedType); // <-- ЛОГ 2
    if (typeFromUrl) {
      if (selectedType !== typeFromUrl) { // Обновляем, только если значение действительно изменилось
        console.log('CATALOG: Setting selectedType from URL in useEffect:', typeFromUrl); // <-- ЛОГ 3
        setSelectedType(typeFromUrl);
      }
    } else {
      if (selectedType !== 'all') { // Если параметра нет, и текущий фильтр не 'all', сбрасываем
        console.log('CATALOG: No type in URL, resetting selectedType to "all"'); // <-- ЛОГ 4
        setSelectedType('all');
      }
    }
  }, [searchParams, selectedType]); // Добавил selectedType в зависимости, чтобы избежать лишних ререндеров, если значение уже то же самое

  const fetchEquipment = useCallback(async () => {
    if (!sanityClient) {
      setFetchError("Клиент Sanity не инициализирован.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setFetchError(null);
    console.log("CATALOG: Fetching equipment data START..."); // <-- ЛОГ 5
    try {
      const sanityData: EquipmentItemSanity[] = await sanityClient.fetch(equipmentQuery);
      console.log("CATALOG: Equipment data FETCHED:", sanityData.length, "items", sanityData); // <-- ЛОГ 6 (показываем сами данные)
      setAllEquipmentSanityItems(sanityData);
    } catch (errFromCatch: unknown) {
      console.error("CATALOG: Ошибка загрузки техники из Sanity:", errFromCatch);
      const message = errFromCatch instanceof Error ? errFromCatch.message : "Неизвестная ошибка.";
      setFetchError(`Не удалось загрузить каталог техники: ${message}`);
    } finally {
      setIsLoading(false);
      console.log("CATALOG: Fetching equipment FINISHED, isLoading:", false); // <-- ЛОГ 7
    }
  }, []); // equipmentQuery - константа, можно убрать из зависимостей

  useEffect(() => {
    console.log("CATALOG: useEffect [fetchEquipment] triggered to call fetchEquipment"); // <-- ЛОГ 8
    fetchEquipment();
  }, [fetchEquipment]);

  const allItemsForCard: EquipmentCardData[] = useMemo(() => {
    console.log("CATALOG: Recalculating allItemsForCard. Sanity items count:", allEquipmentSanityItems.length); // <-- ЛОГ 9
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

  const availableBrands = useMemo(() => { /* ... без изменений ... */
    const brands = new Set(allItemsForCard.map(item => item.brand).filter((b): b is string => !!b && b !== 'Unknown'));
    return ['all', ...Array.from(brands).sort()];
  }, [allItemsForCard]);

  const availableTypes = useMemo(() => { /* ... без изменений ... */
    const typesSet = new Set(allItemsForCard.map(item => item.categoryValue).filter((v): v is string => !!v && v !== ''));
    const typesArray = Array.from(typesSet);
    const displayTypes = typesArray
      .filter(value => value !== 'all')
      .map(value => ({ value: value, title: categoryDisplayNames[value] ?? value }))
      .sort((a, b) => a.title.localeCompare(b.title));
    return [{ value: 'all', title: 'Все типы' }, ...displayTypes];
  }, [allItemsForCard, categoryDisplayNames]);

  const filteredItems = useMemo(() => {
    console.log("CATALOG: Recalculating filteredItems. SelectedType:", selectedType, "SelectedBrand:", selectedBrand, "allItemsForCard count:", allItemsForCard.length); // <-- ЛОГ 10
    const result = allItemsForCard.filter(item =>
      (selectedType === 'all' || item.categoryValue === selectedType) &&
      (selectedBrand === 'all' || item.brand === selectedBrand)
    );
    console.log("CATALOG: Filtered items count:", result.length); // <-- ЛОГ 11
    return result;
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
  
  console.log("CATALOG: Rendering. isLoading:", isLoading, "fetchError:", fetchError, "filteredItems.length:", filteredItems.length); // <-- ЛОГ 12 (перед return)

  if (isLoading && allEquipmentSanityItems.length === 0) {
    // Этот блок будет показан только при самой первой загрузке, когда данных еще нет
    // Если Suspense fallback отрабатывает, этот блок может не понадобиться,
    // но оставим его как дополнительную защиту от "белого экрана" во время первичной загрузки данных внутри ClientCatalogContent
    console.log("CATALOG: Rendering loading indicator (initial load)"); // <-- ЛОГ 13
    return <div className={styles.loadingIndicator}></div>;
  }

  if (fetchError) {
    console.log("CATALOG: Rendering fetch error:", fetchError); // <-- ЛОГ 14
    return <p className={styles.errorIndicator}>{fetchError}</p>;
  }

  // Если не загрузка и нет ошибки, рендерим основной контент
  return (
    <>
      <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
              <label className={styles.filterLabel}><FunnelIcon style={iconStyle} /> Тип техники:</label>
              <div className={styles.filterButtons}>
                  {availableTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => {
                        console.log("CATALOG: Type filter clicked:", type.value); // <-- ЛОГ 15
                        setSelectedType(type.value);
                      }}
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
                      onClick={() => {
                        console.log("CATALOG: Brand filter clicked:", brand); // <-- ЛОГ 16
                        setSelectedBrand(brand);
                      }}
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

      {/* Показываем индикатор загрузки поверх, если isLoading === true, но данные уже есть (т.е. идет перезагрузка/фильтрация) */}
      {isLoading && allEquipmentSanityItems.length > 0 && (
        <div className={styles.overlayLoadingIndicator}>Обновление...</div>
      )}

      <div className={styles.equipmentGrid}>
        {filteredItems.length > 0 ? (
            filteredItems.map((itemData) => (
              <EquipmentCard key={itemData.id} item={itemData} />
            ))
          ) : (
            // Показываем "нет результатов" только если НЕ идет загрузка И нет ошибки
             !isLoading && !fetchError && (
                <div className={styles.noResults}>
                    <p>По вашему запросу техника не найдена.</p>
                    <p>Попробуйте изменить фильтры или сбросить их.</p>
                </div>
             )
          )
        }
      </div>
    </>
  );
}