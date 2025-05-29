// src/app/catalog/ClientCatalogContent.tsx
'use client'; // Этот компонент будет клиентским

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './catalog.module.css'; // Используем те же стили
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

// Принимаем categoryDisplayNames как пропс
interface ClientCatalogContentProps {
  categoryDisplayNames: Record<string, string>;
}

export default function ClientCatalogContent({ categoryDisplayNames }: ClientCatalogContentProps) {
  const searchParams = useSearchParams();
  const initialTypeFromUrl = searchParams.get('type');

  const [allEquipmentSanityItems, setAllEquipmentSanityItems] = useState<EquipmentItemSanity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>(initialTypeFromUrl || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  useEffect(() => {
    // Этот useEffect теперь правильно обновляет selectedType при изменении searchParams
    // Он будет вызван после монтирования компонента на клиенте
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl && typeFromUrl !== selectedType) {
      setSelectedType(typeFromUrl);
    } else if (!typeFromUrl && selectedType !== 'all' && !initialTypeFromUrl) {
      // Если параметр type исчез из URL (например, пользователь его удалил)
      // и initialTypeFromUrl тоже не было (т.е. мы не пришли с параметром)
      // можно сбросить на 'all', если такое поведение нужно.
      // Или оставить как есть, если предполагается, что фильтр сохраняется.
      // Для простоты пока оставим так, чтобы не сбрасывать без явного действия.
    }
  }, [searchParams, selectedType, initialTypeFromUrl]);


  const fetchEquipment = useCallback(async () => {
    if (!sanityClient) {
      setFetchError("Клиент Sanity не инициализирован.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setFetchError(null);
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
  }, []); // Убрал equipmentQuery, так как он константа

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
  }, [allEquipmentSanityItems, categoryDisplayNames]); // Добавил categoryDisplayNames в зависимости

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
  }, [allItemsForCard, categoryDisplayNames]); // Добавил categoryDisplayNames

  const filteredItems = useMemo(() => { /* ... без изменений ... */
    return allItemsForCard.filter(item =>
      (selectedType === 'all' || item.categoryValue === selectedType) &&
      (selectedBrand === 'all' || item.brand === selectedBrand)
    );
  }, [selectedType, selectedBrand, allItemsForCard]);

  const resetFilters = () => { /* ... без изменений ... */
    setSelectedType('all');
    setSelectedBrand('all');
  };

  const areFiltersActive = selectedType !== 'all' || selectedBrand !== 'all';

  const iconStyle = { /* ... без изменений ... */
    width: '20px',
    height: '20px',
    marginRight: '8px',
    display: 'inline-block',
    verticalAlign: 'middle',
  };

  // Состояние загрузки теперь обрабатывается Suspense в родительском компоненте для первоначального рендера
  // Но мы можем оставить локальный isLoading для перезагрузки данных или индикации внутри ClientCatalogContent
  if (isLoading && allEquipmentSanityItems.length === 0) { // Показываем лоадер только при ПЕРВОЙ загрузке данных
    return <div className={styles.loadingIndicator}></div>;
  }

  if (fetchError) {
    return <p className={styles.errorIndicator}>{fetchError}</p>;
  }

  return (
    <> {/* Оборачиваем в фрагмент, так как Suspense ожидает один дочерний элемент */}
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

      {/* Показываем индикатор загрузки поверх, если isLoading === true, но данные уже есть (т.е. идет перезагрузка/фильтрация) */}
      {isLoading && allEquipmentSanityItems.length > 0 && (
        <div className={styles.overlayLoadingIndicator}>Обновление...</div>
      )}

      <div className={styles.equipmentGrid}>
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
          ) : null
        }
      </div>
    </>
  );
}