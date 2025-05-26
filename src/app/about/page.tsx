// src/app/about/page.tsx (Полный код с подготовкой для CSS Modules и изображением)
'use client';

import React from 'react';
import Image from 'next/image'; // Импорт для изображения
import styles from './about.module.css'; // Подключаем CSS модуль
import { motion } from 'framer-motion'; // Импорт для анимации

// Импортируем иконки из Heroicons (outline стиль)
import {
  ShieldCheckIcon,    // Надежность поставок
  LightBulbIcon,      // Экспертиза и Консалтинг
  WrenchScrewdriverIcon, // Комплексный Сервис
  BanknotesIcon       // Финансовые Решения
} from '@heroicons/react/24/outline';

// Варианты анимации для секций и элементов
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 1) => ({ // Добавляем возможность кастомной задержки
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1, // Небольшая задержка на основе индекса или значения
      ease: 'easeOut',
      staggerChildren: 0.1
    }
  })
};

// Варианты анимации для карточек преимуществ
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] } // Custom cubic-bezier
  }
};

// Основной компонент страницы
export default function AboutPage() {
  return (
    // Используем корневой div для применения стилей страницы, если необходимо
    <div className={styles.aboutPage}> 

      {/* --- Верхний блок с заголовком, интро и изображением --- */}
      <motion.section
        className={`${styles.section} ${styles.introSection}`}
        initial="hidden"
        animate="visible" // Запускаем анимацию сразу при загрузке
        custom={1} // Передаем кастомный параметр для задержки (не обязательно)
        variants={sectionVariants}
      >
        <div className={styles.container}> {/* Общий контейнер */}
          <div className={styles.introGrid}> {/* Сетка для текста и фото */}

            {/* Левая часть - Текстовый контент */}
            <motion.div variants={sectionVariants}> {/* Анимация для текстового блока */}
              <h1 className={styles.pageTitle}>О компании ООО {'"'}Бизнес-Партнер{'"'}</h1> {/* Используем {'"'} для кавычек */}
              <p className={styles.introText}>
                Уже более 10 лет ООО {'"'}Бизнес-Партнер{'"'} является надежным связующим звеном между ведущими производителями спецтехники и предприятиями, стремящимися к эффективности и развитию. Мы не просто продаем машины – мы предлагаем проверенные решения и строим долгосрочные партнерские отношения.
              </p>
              <p className={styles.introParagraph}> {/* Добавлен класс для возможной доп. стилизации */}
                Наша команда объединяет опытных специалистов, глубоко разбирающихся в особенностях эксплуатации и обслуживания экскаваторов, погрузчиков и другой техники. Мы всегда готовы предоставить профессиональную консультацию и помочь выбрать оборудование, идеально соответствующее вашим задачам и бюджету.
              </p>
            </motion.div>

            {/* Правая часть - ИЗОБРАЖЕНИЕ ОФИСА */}
            <motion.div 
               className={styles.introImageContainer} 
               variants={sectionVariants} // Анимация для контейнера изображения
               initial="hidden" // Чтобы анимация сработала при прокрутке или вместе с остальным блоком
               animate="visible" 
               custom={1.5} // Небольшая задержка относительно текста
             >
              <Image
                src="/images/office-photo.jpg" // УКАЖИТЕ ПРАВИЛЬНОЕ РАСШИРЕНИЕ!
                alt="Офис или команда компании Бизнес-Партнер" // ЗАМЕНИТЕ ALT!
                fill // Растягивает изображение на родительский контейнер
                className={styles.introImage} // Класс для стилизации изображения
                sizes="(max-width: 768px) 90vw, 45vw" // Адаптируйте под ваш дизайн
                priority // Можно оставить для быстрой загрузки
              />
            </motion.div>

          </div> {/* Конец .introGrid */}
        </div> {/* Конец .container */}
      </motion.section>

      {/* --- Секция Миссия --- */}
      <motion.section
        className={`${styles.section} ${styles.missionSection} ${styles.sectionGray}`} // Добавлен класс для фона и отступов
        initial="hidden"
        whileInView="visible" // Анимация при появлении в области видимости
        viewport={{ once: true, amount: 0.3 }} // Настройки триггера анимации
        variants={sectionVariants} // Используем общие варианты для секции
        custom={1} // Можно задать задержку
      >
        <div className={styles.container}>
          <h2 className={`${styles.sectionTitle} ${styles.missionTitle}`}>
            Наша миссия
          </h2>
          <div className={styles.textBlock} style={{ maxWidth: '850px', margin: '0 auto' }}> {/* Центрируем блок текста */}
            <p className={styles.missionText}>
              {/* Используем кавычки-ёлочки */}
              «Обеспечивать российский бизнес передовой и надежной спецтехникой, способствуя росту эффективности и реализации самых амбициозных проектов через экспертный подход и первоклассный сервис.»
            </p>
          </div>
        </div>
      </motion.section>

       {/* --- Секция Преимущества (Почему нам доверяют?) --- */}
       <section className={`${styles.section} ${styles.advantagesSection}`}> {/* Добавлен класс */}
         <div className={styles.container}>
            <motion.h2
              className={styles.sectionTitle}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={sectionVariants} // Анимация заголовка
              custom={1} // Можно задать задержку
            >
                Почему нам доверяют?
            </motion.h2>

            {/* Сетка для карточек преимуществ */}
            <motion.div
              className={styles.advantagesGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={{
                visible: { transition: { staggerChildren: 0.15 } } // Только stagger для контейнера
              }}
            >
              {/* Карточка 1 */}
              <motion.div className={styles.advantageCard} variants={cardVariants}>
                <div className={styles.advantageIconWrapper}> <ShieldCheckIcon className={styles.icon} /> </div>
                <h3 className={styles.advantageTitle}>Надежность поставок</h3>
                <p className={styles.advantageText}>Прямые контракты с заводами-изготовителями и отлаженная логистика гарантируют своевременное получение техники.</p>
              </motion.div>

              {/* Карточка 2 */}
              <motion.div className={styles.advantageCard} variants={cardVariants}>
                 <div className={styles.advantageIconWrapper}> <LightBulbIcon className={styles.icon} /> </div>
                <h3 className={styles.advantageTitle}>Экспертиза и Консалтинг</h3>
                <p className={styles.advantageText}>Помогаем подобрать оптимальную комплектацию техники под специфику ваших задач и условий эксплуатации.</p>
              </motion.div>

               {/* Карточка 3 */}
               <motion.div className={styles.advantageCard} variants={cardVariants}>
                 <div className={styles.advantageIconWrapper}> <WrenchScrewdriverIcon className={styles.icon} /> </div>
                <h3 className={styles.advantageTitle}>Комплексный Сервис</h3>
                <p className={styles.advantageText}>Собственный сервисный центр, склад запчастей и выездные бригады для оперативного обслуживания.</p>
               </motion.div>

               {/* Карточка 4 */}
               <motion.div className={styles.advantageCard} variants={cardVariants}>
                 <div className={styles.advantageIconWrapper}> <BanknotesIcon className={styles.icon} /> </div>
                <h3 className={styles.advantageTitle}>Финансовые Решения</h3>
                <p className={styles.advantageText}>Предлагаем гибкие условия покупки, программы лизинга и аренды техники на выгодных условиях.</p>
               </motion.div>
            </motion.div> {/* Конец сетки .advantagesGrid */}

          </div> {/* Конец .container */}
       </section>

        {/* --- Место для возможных будущих секций --- */}

    </div> // Конец корневого div .aboutPage
  );
}