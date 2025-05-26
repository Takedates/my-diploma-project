// src/components/ui/Modal/Modal.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string; // Необязательный заголовок модалки
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Закрытие по клику вне модального окна
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Закрытие по нажатию Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Блокируем прокрутку фона
      document.body.style.overflow = 'hidden';
    } else {
      // Возвращаем прокрутку
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Убедимся, что прокрутка возвращается при размонтировании, если окно было открыто
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          onClick={handleBackdropClick}
          initial="hidden"
          animate="visible"
          exit="hidden" // Плавное исчезновение фона
          variants={backdropVariants}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={modalRef}
            className={styles.modalContent}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            // Предотвращаем всплытие клика с контента на фон
            onClick={(e) => e.stopPropagation()}
          >
            {/* Верхняя часть с заголовком и кнопкой закрытия */}
            <div className={styles.header}>
              {title && <h2 className={styles.title}>{title}</h2>}
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Закрыть модальное окно"
              >
                {/* Простая иконка крестика */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Основное содержимое */}
            <div className={styles.body}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;