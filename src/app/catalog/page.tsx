// src/app/catalog/page.tsx
import React, { Suspense } from 'react'; // 1. ИМПОРТИРУЙТЕ Suspense
import styles from './catalog.module.css'; // Убедитесь, что этот файл существует
import ClientCatalogContent from './ClientCatalogContent'; // 2. СОЗДАДИМ ЭТОТ ФАЙЛ

// Отображаемые имена категорий могут остаться здесь или быть перенесены в ClientCatalogContent,
// если они нужны только там. Для простоты оставим здесь, если они не меняются динамически.
const categoryDisplayNames: Record<string, string> = {
  'wheeled-excavator': 'Колесные экскаваторы',
  'tracked-excavator': 'Гусеничные экскаваторы',
  'loader': 'Погрузчики',
  'dump-truck': 'Самосвалы',
};

export default function CatalogPage() {
  return (
    <div className={styles.catalogPageContainer}> {/* Общий контейнер может остаться серверным */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Каталог <span className={styles.titleHighlight}>спецтехники</span></h1>
        <p className={styles.pageSubtitle}>Выберите необходимую технику из нашего широкого ассортимента.</p>
      </div>
      
      {/* 3. ОБЕРНИТЕ КЛИЕНТСКИЙ КОМПОНЕНТ В SUSPENSE */}
      <Suspense fallback={<div className={styles.loadingIndicator}>Загрузка каталога...</div>}>
        <ClientCatalogContent categoryDisplayNames={categoryDisplayNames} />
      </Suspense>
    </div>
  );
}