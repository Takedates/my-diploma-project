// src/components/EquipmentRequestForm/EquipmentRequestForm.tsx
'use client';

import React, { useState, useTransition } from 'react';
import styles from './EquipmentRequestForm.module.css';
import { submitEquipmentRequest } from '@/app/actions/submitEquipmentRequest';

interface EquipmentRequestFormProps {
  equipmentId: string;
  equipmentName: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const EquipmentRequestForm: React.FC<EquipmentRequestFormProps> = ({
  equipmentId,
  equipmentName,
  onSuccess,
  onClose,
}) => {
  // Состояния для полей формы
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('+7'); // Начинаем с +7
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isPrivacyPolicyAccepted, setIsPrivacyPolicyAccepted] = useState(false);

  // Состояния для статуса формы
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Регулярные выражения для валидации
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@.]+$/; // Требуем точку в домене
  const phoneRegex = /^\+7\d{10}$/; // Строго +7 и 10 цифр

  // Обработчик для поля телефона (контролирует +7 и длину)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.startsWith('+7')) {
      const digits = value.substring(2).replace(/\D/g, '');
      value = '+7' + digits.substring(0, 10);
    } else if (value === '+' || value === '') {
      value = '+';
    } else {
      value = '+7' + value.replace(/\D/g, '').substring(0, 10);
    }
    setPhone(value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Валидация данных из состояний
    const nameTrimmed = customerName.trim();
    const phoneTrimmed = phone.trim(); // Телефон уже в нужном формате из handlePhoneChange
    const emailTrimmed = email.trim();

    if (!nameTrimmed) { setError('Пожалуйста, укажите ваше имя.'); return; }
    if (nameTrimmed.length < 2) { setError('Имя должно содержать не менее 2 символов.'); return; }

    const hasPhone = phoneTrimmed.length === 12 && phoneRegex.test(phoneTrimmed); // Проверяем полный формат +7...
    const hasEmail = !!emailTrimmed;

    if (!hasPhone && !hasEmail) { setError('Пожалуйста, укажите корректный телефон или Email.'); return; }
    if (emailTrimmed && !emailRegex.test(emailTrimmed)) { setError('Пожалуйста, введите корректный Email адрес.'); return; }
    // Дополнительная проверка телефона, если Email не указан
    if (!hasEmail && !hasPhone) { setError('Пожалуйста, введите корректный номер телефона (формат +7XXXXXXXXXX).'); return; }
    // Проверка телефона, если он введен (даже если email тоже есть)
    if (phoneTrimmed !== '+7' && phoneTrimmed.length > 2 && !hasPhone) { setError('Пожалуйста, введите корректный номер телефона (формат +7XXXXXXXXXX).'); return; }

    if (!isPrivacyPolicyAccepted) { setError('Необходимо принять условия обработки персональных данных.'); return; }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('equipmentId', equipmentId);
      formData.append('equipmentName', equipmentName);
      formData.append('customerName', nameTrimmed);
      // Передаем корректный телефон или пустую строку, если он не введен/невалиден
      formData.append('phone', hasPhone ? phoneTrimmed : '');
      formData.append('email', hasEmail ? emailTrimmed : '');
      formData.append('comment', comment.trim());
      formData.append('isPrivacyPolicyAccepted', String(isPrivacyPolicyAccepted));

      try {
        const result = await submitEquipmentRequest(formData);

        if (result?.error) {
          console.error('Ошибка отправки запроса (Server Action):', result.error);
          setError(`Ошибка отправки: ${result.error}`);
        } else {
          setSuccessMessage('Ваш запрос успешно отправлен! Мы свяжемся с вами в ближайшее время.');
          // Сброс состояний формы
          setCustomerName('');
          setPhone('+7'); // Сброс телефона к +7
          setEmail('');
          setComment('');
          setIsPrivacyPolicyAccepted(false);
          // Вызов onSuccess с задержкой
          setTimeout(() => {
             if (onSuccess) onSuccess();
          }, 2000); // Уменьшил задержку до 2 сек
        }
      } catch (err) {
         console.error('Неожиданная ошибка при вызове Server Action:', err);
         setError('Произошла неожиданная ошибка при отправке запроса.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

      {/* Скрываем поля формы после успешной отправки */}
      {!successMessage && (
         <>
           {/* Имя */}
           <div className={styles.formGroup}>
             <label htmlFor="request-customer-name" className={styles.label}>Ваше имя<span className={styles.requiredStar}>*</span></label>
             <input
               type="text"
               id="request-customer-name"
               value={customerName}
               onChange={(e) => setCustomerName(e.target.value)}
               required // Оставляем required для нативной валидации браузера
               disabled={isPending}
               className={styles.input}
               placeholder="Иван Иванов" // Добавлен плейсхолдер
             />
           </div>

           {/* Email */}
           <div className={styles.formGroup}>
             <label htmlFor="request-email" className={styles.label}>Email</label>
             <input
               type="email"
               id="request-email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               disabled={isPending}
               placeholder="example@mail.com" // Добавлен плейсхолдер
               className={styles.input}
             />
           </div>

           {/* Телефон */}
           <div className={styles.formGroup}>
             <label htmlFor="request-phone" className={styles.label}>Контактный телефон</label>
             <input
               type="tel"
               id="request-phone"
               value={phone}
               onChange={handlePhoneChange} // Используем новый обработчик
               disabled={isPending}
               placeholder="+7(___)___-__-__" // Изменен плейсхолдер
               maxLength={12} // Ограничение длины
               className={styles.input}
             />
             <p className={styles.fieldSubText}>Укажите Email или телефон<span className={styles.requiredStar}>*</span></p> {/* Добавлена звездочка */}
           </div>

           {/* Комментарий */}
           <div className={styles.formGroup}>
             <label htmlFor="request-comment" className={styles.label}>Комментарий</label>
             <textarea
               id="request-comment"
               value={comment}
               onChange={(e) => setComment(e.target.value)}
               rows={4}
               disabled={isPending}
               placeholder="Например: интересует актуальная стоимость, условия доставки..." // Уточнен плейсхолдер
               className={styles.textarea}
             />
           </div>

           {/* Согласие */}
           <div className={styles.formGroupCheckbox}>
            <input
              type="checkbox"
              id="privacyPolicyEqForm"
              name="privacyPolicy" // Атрибут name нужен для FormData, если бы мы его использовали напрямую
              checked={isPrivacyPolicyAccepted}
              onChange={(e) => setIsPrivacyPolicyAccepted(e.target.checked)}
              required // Оставляем required
              className={styles.checkboxInput}
              disabled={isPending}
            />
            <label htmlFor="privacyPolicyEqForm" className={styles.checkboxLabel}>
              Я даю свое согласие на обработку персональных данных и принимаю условия{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={styles.privacyLink}>
                Политики конфиденциальности
              </a>
              <span className={styles.requiredStar}>*</span>
            </label>
          </div>

           {/* Пометка об обязательных полях */}
           <p className={styles.requiredNote}><span className={styles.requiredStar}>*</span> - Обязательные для заполнения поля</p>

            {/* Кнопки */}
            <div className={styles.formActions}>
                 {onClose && (
                    <button type="button" onClick={onClose} className={`${styles.button} ${styles.cancelButton}`} disabled={isPending}>
                        Отмена
                    </button>
                 )}
                 <button type="submit" className={`${styles.button} ${styles.submitButton}`} disabled={isPending}>
                     {isPending ? 'Отправка...' : 'Отправить запрос'}
                 </button>
            </div>
         </>
      )}
    </form>
  );
};

export default EquipmentRequestForm;