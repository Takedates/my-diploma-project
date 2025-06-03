// src/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './HomePage.module.css'; 

// --- Иконки ---
import {
  ShieldCheckIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
// --------------------------

// --- Данные для категорий техники ---
const equipmentCategories = [
  {
    name: 'Самосвалы',
    type: 'dump-truck', // Это значение будет передано в URL как ?type=dump-truck
    imageUrl: '/images/placeholder-dump-truck.jpg',
    description: 'Надежные самосвалы для перевозки грузов.',
  },
  {
    name: 'Гусеничные экскаваторы',
    type: 'tracked-excavator', // Это значение будет передано в URL
    imageUrl: '/images/placeholder-tracked.jpeg',
    description: 'Мощные машины для сложных грунтов.',
  },
  {
    name: 'Погрузчики',
    type: 'loader', // Это значение будет передано в URL
    imageUrl: '/images/placeholder-loader.jpg',
    description: 'Универсальная техника для погрузки.',
  },
];
// ----------------------------------

// --- Анимации ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    }
  }
};

export default function HomePage() {
  return (
    <>

      {/* ==================== Hero Section ==================== */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <motion.h1
            className={styles.heroTitle}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            Надежная <span className={styles.heroTitleHighlight}>спецтехника</span> для вашего бизнеса
          </motion.h1>
          <motion.p
            className={styles.heroSubtitle}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          >
            Экскаваторы, погрузчики и самосвалы от ООО «Бизнес-Партнер». Гарантия качества, сервисное обслуживание и гибкие условия поставки.
          </motion.p>
          <motion.div
             initial="hidden"
             animate="visible"
             variants={fadeInUp}
             transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
          >
            <Link href="/catalog" className={styles.heroButton}>
              Перейти в каталог
              <ArrowRightIcon className={styles.heroButtonIcon} />
            </Link>
          </motion.div>
        </div>
      </section>
      {/* ==================== End Hero Section ==================== */}


      {/* === SVG разделитель (Волна) === */}
      <div className={styles.shapeDivider}>
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31.74,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className={styles.shapeFill}></path>
          </svg>
      </div>


      {/* ==================== Секция Преимущества ==================== */}
      <section className={`${styles.section} ${styles.sectionGray}`}>
         <div className={styles.sectionContainer}>
             <motion.h2
              className={styles.sectionTitle}
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}
            >
                Почему выбирают <span className={styles.sectionTitleHighlight}>нас?</span>
            </motion.h2>
            <motion.div
                className={styles.featuresGrid}
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
             >
              {/* Преимущество 1 */}
              <motion.div className={styles.featureItem} variants={fadeInUp}>
                <div className={styles.featureIconWrapper}> <ShieldCheckIcon className={styles.featureIcon} /> </div>
                <h3 className={styles.featureTitle}>Надежность и Опыт</h3>
                <p className={styles.featureText}>Более 14 лет на рынке поставок спецтехники. Гарантия качества и стабильности.</p>
              </motion.div>
              {/* Преимущество 2 */}
              <motion.div className={styles.featureItem} variants={fadeInUp}>
                 <div className={styles.featureIconWrapper}> <CpuChipIcon className={styles.featureIcon} /> </div>
                <h3 className={styles.featureTitle}>Экспертный Подбор</h3>
                <p className={styles.featureText}>Помогаем выбрать оптимальную технику и комплектацию под ваши задачи.</p>
              </motion.div>
              {/* Преимущество 3 */}
              <motion.div className={styles.featureItem} variants={fadeInUp}>
                 <div className={styles.featureIconWrapper}> <WrenchScrewdriverIcon className={styles.featureIcon} /> </div>
                <h3 className={styles.featureTitle}>Сервис и поддержка</h3>
                <p className={styles.featureText}>Гарантийное и постгарантийное обслуживание, оперативная поставка запчастей.</p>
              </motion.div>
              {/* Преимущество 4 */}
               <motion.div className={styles.featureItem} variants={fadeInUp}>
                 <div className={styles.featureIconWrapper}> <UserGroupIcon className={styles.featureIcon} /> </div>
                <h3 className={styles.featureTitle}>Гибкие условия</h3>
                <p className={styles.featureText}>Индивидуальный подход, выгодные предложения по продаже, лизингу.</p>
               </motion.div>
            </motion.div>
         </div>
      </section>
      {/* ==================== End Секция Преимущества ==================== */}


       {/* === SVG разделитель (Скос) === */}
       <div className={styles.shapeDividerAngle}>
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" className={styles.shapeFillAngle}></path>
          </svg>
      </div>
      {/* =============================== */}


      {/* ==================== Секция Техника ==================== */}
       <section className={`${styles.section} ${styles.sectionWhite}`}>
         <div className={styles.sectionContainer}>
             <motion.h2
              className={styles.sectionTitle}
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}
            >
               Наша <span className={styles.sectionTitleHighlight}>техника</span>
            </motion.h2>
            <motion.div
                className={styles.equipmentGrid}
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
              {equipmentCategories.map((category) => (
                <motion.div
                    key={category.type}
                    className={styles.equipmentCard}
                    variants={fadeInUp}
                    whileHover="hover" 
                    initial="rest"   
                 >
                    <div className={styles.equipmentImageWrapper}>
                        <Image
                            src={category.imageUrl}
                            alt={category.name}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={(e) => console.error(`Ошибка загрузки изображения для ${category.name}: ${category.imageUrl}`, e.currentTarget.currentSrc)}
                         />
                         <div className={styles.equipmentImageOverlay}></div>
                          <motion.h3
                            className={styles.equipmentTitleOverImage}
                          >
                            {category.name}
                          </motion.h3>
                    </div>
                    <div className={styles.equipmentCardContent}>
                        <p className={styles.equipmentDescription}>{category.description}</p>
                        <Link
                            href={`/catalog?type=${category.type}`} // Ссылка для перехода с фильтром
                            className={styles.equipmentButton}
                        >
                            Смотреть модели
                            <ArrowRightIcon /> 
                        </Link>
                    </div>
                </motion.div>
              ))}
            </motion.div>
         </div>
      </section>
      {/* ==================== End Секция Техника ==================== */}

    </>
  );
}