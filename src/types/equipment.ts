// src/types/equipment.ts (СКОРРЕКТИРОВАННЫЙ ЕДИНЫЙ ТИП)
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Тип данных, получаемых из Sanity (проверьте имена полей!)
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

// --- ЕДИНЫЙ ТИП для данных, передаваемых в EquipmentCard ---
// --- СОДЕРЖИТ ПОЛЯ, КОТОРЫЕ ОЖИДАЕТ EquipmentCard ---
export interface EquipmentCardData {
  id: string;
  name: string;
  // Поля, требуемые EquipmentCard согласно ошибке TS2739:
  category: string;         // Отображаемое имя категории
  categoryValue: string;    // Значение категории для фильтра
  image: { asset?: SanityImageSource | null; alt?: string | null } | null; // Объект изображения
  link: string;             // Ссылка на страницу товара
  // --- Остальные поля, которые вы используете в карточке ---
  brand: string;            // Бренд для отображения (строка, т.к. есть запасной вариант)
  excerpt?: string;         // Описание (опционально)
  status?: string | null;   // Статус наличия
}
// ----------------------------------------------------------