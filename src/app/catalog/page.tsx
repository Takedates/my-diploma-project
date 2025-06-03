// src/app/catalog/page.tsx
import React, { Suspense } from 'react'; 
import styles from './catalog.module.css'; 
import ClientCatalogContent from './ClientCatalogContent'; 

// Отображаемые имена категорий 
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
      
      {/* КЛИЕНТСКИЙ КОМПОНЕНТ В SUSPENSE */}
      <Suspense fallback={<div className={styles.loadingIndicator}>Загрузка каталога...</div>}>
        <ClientCatalogContent categoryDisplayNames={categoryDisplayNames} />
      </Suspense>
    </div>
  );
}