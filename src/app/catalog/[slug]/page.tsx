// src/app/catalog/[slug]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PortableText, PortableTextBlock } from '@portabletext/react';
import { motion, AnimatePresence } from 'framer-motion';

import { sanityClient, urlFor, SanityImageSource } from '@/lib/sanityClient';
import { groq } from 'next-sanity';
import Modal from '@/components/ui/Modal/Modal';
import EquipmentRequestForm from '@/components/EquipmentRequestForm/EquipmentRequestForm';

import styles from './equipmentDetail.module.css';

// --- ТИПЫ ---
interface GalleryImage {
  _key: string;
  asset?: SanityImageSource;
  alt?: string;
}

interface Specification {
  _key: string;
  specName?: string;
  specValue?: string;
}

interface FullEquipmentData {
  _id: string;
  name?: string;
  slug?: { current?: string };
  category?: { title?: string; slug?: { current?: string } };
  brand?: { name?: string };
  mainImage?: { asset?: SanityImageSource; alt?: string };
  gallery?: GalleryImage[];
  description?: PortableTextBlock[];
  specifications?: Specification[];
  isAvailable?: boolean;
}

interface PageProps {
  params: {
    slug: string;
  };
}

// --- GROQ ЗАПРОС ---
const equipmentDetailQuery = groq`*[_type == "equipment" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  "category": category->{title, slug},
  "brand": brand->{name},
  mainImage { asset, alt },
  gallery[] { _key, asset, alt },
  description,
  specifications,
  isAvailable
}`;

// УБИРАЕМ generateStaticParams ОТСЮДА

export default function EquipmentDetailPage({ params }: PageProps) {
  const { slug } = params;

  const [equipment, setEquipment] = useState<FullEquipmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEquipmentData = async () => {
      if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        setError("Идентификатор техники (slug) некорректен или отсутствует.");
        setLoading(false);
        return;
      }
      if (!sanityClient) {
        setError("Клиент Sanity не инициализирован.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setEquipment(null);
      setSelectedImageUrl(null);

      try {
        const data = await sanityClient.fetch<FullEquipmentData | null>(equipmentDetailQuery, { slug });
        if (data) {
          setEquipment(data);
          if (data.mainImage?.asset) {
            setSelectedImageUrl(urlFor(data.mainImage.asset)?.width(900).height(600).auto('format').url() ?? '/images/placeholder-detail.jpg');
          } else if (data.gallery && data.gallery.length > 0 && data.gallery[0].asset) {
            setSelectedImageUrl(urlFor(data.gallery[0].asset)?.width(900).height(600).auto('format').url() ?? '/images/placeholder-detail.jpg');
          } else {
            setSelectedImageUrl('/images/placeholder-detail.jpg');
          }
        } else {
          setError(`Техника с адресом "${slug}" не найдена.`);
          setSelectedImageUrl('/images/placeholder-detail.jpg');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
            setError(`Не удалось загрузить информацию о технике: ${err.message}`);
        } else {
            setError("Не удалось загрузить информацию о технике: Неизвестная ошибка.");
        }
        setSelectedImageUrl('/images/placeholder-detail.jpg');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentData();
  }, [slug]);

  const handleThumbnailClick = (imageAsset?: SanityImageSource) => {
    if (imageAsset) {
      const newUrl = urlFor(imageAsset)?.width(900).height(600).auto('format').url();
      setSelectedImageUrl(newUrl ?? '/images/placeholder-detail.jpg');
    } else {
      setSelectedImageUrl('/images/placeholder-detail.jpg');
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (loading) {
    return <div className={styles.loadingMessage}>Загрузка информации о технике...</div>;
  }
  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }
  if (!equipment) {
    return <div className={styles.infoMessage}>Информация о технике не найдена или временно недоступна.</div>;
  }

  const categoryLink = equipment.category?.slug?.current
    ? `/catalog?category=${equipment.category.slug.current}`
    : "/catalog";
  const categoryTitle = equipment.category?.title ?? 'Каталог';

  return (
    // ... остальной JSX без изменений ...
    <>
      <div className={styles.detailContainer}>
        <nav className={styles.breadcrumbs}>
          <Link href="/catalog">Каталог</Link> /
          {equipment.category?.title && equipment.category?.slug?.current && (
            <>
              <Link href={categoryLink}>{categoryTitle}</Link> /
            </>
          )}
          <span>{equipment.name ?? 'Детали техники'}</span>
        </nav>

        <h1 className={styles.title}>{equipment.name ?? 'Название техники отсутствует'}</h1>

        <div className={styles.mainContent}>
          <div className={styles.gallery}>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImageUrl || 'placeholder-image'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={styles.mainImageWrapper}
              >
                {selectedImageUrl && selectedImageUrl !== '/images/placeholder-detail.jpg' ? (
                  <Image
                    src={selectedImageUrl}
                    alt={equipment.mainImage?.alt || equipment.name || 'Основное фото техники'}
                    width={900} height={600} priority className={styles.mainImage}
                    style={{ objectFit: 'contain' }}
                  />
                ) : (
                  <div className={styles.mainImagePlaceholder}>
                    <Image src="/images/placeholder-detail.jpg" alt="Изображение отсутствует" width={900} height={600} style={{ objectFit: 'contain' }}/>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {(equipment.gallery && equipment.gallery.length > 0) || equipment.mainImage?.asset ? (
              <div className={styles.thumbnailGrid}>
                {equipment.mainImage?.asset && (
                  <div
                    className={`${styles.thumbnailWrapper} ${selectedImageUrl === urlFor(equipment.mainImage.asset)?.width(900).height(600).auto('format').url() ? styles.activeThumbnail : ''}`}
                    onClick={() => handleThumbnailClick(equipment.mainImage?.asset)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleThumbnailClick(equipment.mainImage?.asset); }}
                    tabIndex={0} role="button" aria-label={`Показать ${equipment.mainImage?.alt || 'главное фото'}`}
                  >
                    <Image src={urlFor(equipment.mainImage.asset)?.width(150).height(100).auto('format').url() ?? '/images/placeholder-thumb.jpg'} alt={equipment.mainImage?.alt || 'Главное фото'} width={150} height={100} className={styles.thumbnailImage}/>
                  </div>
                )}
                {equipment.gallery?.map((imgItem) => {
                  if (!imgItem.asset) return null;
                  const thumbUrl = urlFor(imgItem.asset)?.width(150).height(100).auto('format').url();
                  if (!thumbUrl) return null;
                  const bigImageUrl = urlFor(imgItem.asset)?.width(900).height(600).auto('format').url();
                  return (
                    <div
                      key={imgItem._key}
                      className={`${styles.thumbnailWrapper} ${selectedImageUrl === bigImageUrl ? styles.activeThumbnail : ''}`}
                      onClick={() => handleThumbnailClick(imgItem.asset)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleThumbnailClick(imgItem.asset); }}
                      tabIndex={0} role="button" aria-label={`Показать ${imgItem.alt || 'дополнительное фото'}`}
                    >
                      <Image src={thumbUrl} alt={imgItem.alt || 'Доп. фото'} width={150} height={100} className={styles.thumbnailImage}/>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className={styles.mainInfo}>
            <h2 className={styles.sectionTitle}>Основные характеристики</h2>
            {equipment.specifications && equipment.specifications.length > 0 ? (
              <table className={styles.specsTable}>
                <tbody>
                  {equipment.specifications.map((spec) => (
                    spec.specName && spec.specValue && (
                      <tr key={spec._key || spec.specName}>
                        <th>{spec.specName}</th>
                        <td>{spec.specValue}</td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            ) : (<p>Характеристики не указаны.</p>)}

            <p className={equipment.isAvailable === false ? styles.statusUnavailable : styles.statusAvailable}>
              {equipment.isAvailable === false ? '✕ Нет в наличии / Под заказ' : '✓ В наличии'}
            </p>

            <button className={styles.requestButton} onClick={openModal}>
              Запросить цену / Консультацию
            </button>
          </div>
        </div>

        {equipment.description && equipment.description.length > 0 && (
          <section className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>Описание</h2>
            <div className={styles.descriptionContent}>
              <PortableText value={equipment.description} />
            </div>
          </section>
        )}

        <div className={styles.backLinkWrapper}>
          <Link href="/catalog" className={styles.backLink}>
            ← Назад в каталог
          </Link>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`Запрос по технике: ${equipment.name || 'техника без названия'}`}
      >
        <EquipmentRequestForm
          equipmentId={equipment.slug?.current || slug || "unknown-slug"}
          equipmentName={equipment.name || 'Неизвестная техника'}
          onSuccess={() => {
            closeModal();
          }}
          onClose={closeModal}
        />
      </Modal>
    </>
  );
}