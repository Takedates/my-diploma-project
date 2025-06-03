// src/types/equipment.ts
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Тип данных, получаемых из Sanity 
export interface EquipmentItemSanity {
    _id: string;
    name?: string | null;
    slug?: { current?: string | null } | null;
    category?: string | null; // Имя поля категории в Sanity
    brand?: string | null;
    excerpt?: string | null;  // Имя поля краткого описания в Sanity
    mainImage?: { asset?: SanityImageSource | null; alt?: string | null } | null;
    status?: string | null;
}


export interface EquipmentCardData {
  id: string;
  name: string;
  category: string;         // Отображаемое имя категории
  categoryValue: string;    // Значение категории для фильтра
  image: { asset?: SanityImageSource | null; alt?: string | null } | null; // Объект изображения
  link: string;             // Ссылка на страницу товара
  brand: string;            // Бренд для отображения (строка, т.к. есть запасной вариант)
  excerpt?: string;         // Описание (опционально)
  status?: string | null;   // Статус наличия
}
