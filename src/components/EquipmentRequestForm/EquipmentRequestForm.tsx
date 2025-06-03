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
  const [phone, setPhone] = useState('+7'); 
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isPrivacyPolicyAccepted, setIsPrivacyPolicyAccepted] = useState(false);

  // Состояния для статуса формы
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Регулярные выражения для валидации
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@.]+$/; 
  const phoneRegex = /^\+7\d{10}$/; 
  // Обработчик для поля телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Убедимся, что ввод начинается с '+7'
    if (!value.startsWith('+7')) {
      value = '+7' + value.replace(/\D/g, ''); 
    } else {
      value = '+7' + value.substring(2).replace(/\D/g, ''); 
    }
    setPhone(value.substring(0, 12));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const nameTrimmed = customerName.trim();
    const phoneValue = phone.trim(); 
    const emailValue = email.trim();

    // 1. Валидация ФИО
    if (!nameTrimmed) { setError('Пожалуйста, укажите ваше ФИО.'); return; }
    if (nameTrimmed.length < 2) { setError('ФИО должно содержать не менее 2 символов.'); return; }

    // 2. Валидация Телефон ИЛИ Email
    const isValidPhoneFormat = phoneValue.length === 12 && phoneRegex.test(phoneValue);
    const isValidEmailFormat = emailValue && emailRegex.test(emailValue);

    if (!isValidPhoneFormat && !isValidEmailFormat) {
        setError('Необходимо указать корректный контактный телефон или Email.');
        return;
    }
    if (emailValue && !isValidEmailFormat) {
        setError('Некорректный формат Email. Пожалуйста, проверьте правильность ввода.');
        return;
    }
    if (phoneValue !== '+7' && phoneValue.length > 2 && !isValidPhoneFormat) {
        setError('Некорректный формат телефона. Ожидается +7 и 10 цифр (например, +79001234567).');
        return;
    }

    // 3. Валидация согласия на обработку персональных данных
    if (!isPrivacyPolicyAccepted) { setError('Необходимо принять условия обработки персональных данных.'); return; }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('equipmentId', equipmentId);
      formData.append('equipmentName', equipmentName);
      formData.append('customerName', nameTrimmed);
      // Передаем валидный телефон или пустую строку
      formData.append('phone', isValidPhoneFormat ? phoneValue : '');
      // Передаем валидный Email или пустую строку
      formData.append('email', isValidEmailFormat ? emailValue : '');
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
          setPhone('+7'); 
          setEmail('');
          setComment('');
          setIsPrivacyPolicyAccepted(false);
          // Вызов onSuccess с задержкой
          setTimeout(() => {
             if (onSuccess) onSuccess();
          }, 2000); 
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
           {/* ФИО */}
           <div className={styles.formGroup}>
             <label htmlFor="request-customer-name" className={styles.label}>Ваше ФИО<span className={styles.requiredStar}>*</span></label> {/* ИСПРАВЛЕНО: на "Ваше ФИО" */}
             <input
               type="text"
               id="request-customer-name"
               name="customerName" 
               value={customerName}
               onChange={(e) => setCustomerName(e.target.value)}
               required 
               disabled={isPending}
               className={styles.input}
               placeholder="Иванов Иван Иванович" 
             />
           </div>

           {/* Email */}
           <div className={styles.formGroup}>
             <label htmlFor="request-email" className={styles.label}>Email</label>
             <input
               type="email"
               id="request-email"
               name="email" 
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               disabled={isPending}
               placeholder="example@mail.com" 
               className={styles.input}
             />
           </div>

           {/* Телефон */}
           <div className={styles.formGroup}>
             <label htmlFor="request-phone" className={styles.label}>Контактный телефон</label>
             <input
               type="tel"
               id="request-phone"
               name="phone"
               value={phone}
               onChange={handlePhoneChange} 
               disabled={isPending}
               placeholder="+7(___)___-__-__" 
               maxLength={12} 
               className={styles.input}
             />
             <p className={styles.fieldSubText}>Укажите Email или телефон<span className={styles.requiredStar}>*</span></p>
           </div>

           {/* Комментарий */}
           <div className={styles.formGroup}>
             <label htmlFor="request-comment" className={styles.label}>Комментарий</label>
             <textarea
               id="request-comment"
               name="comment" 
               value={comment}
               onChange={(e) => setComment(e.target.value)}
               rows={4}
               disabled={isPending}
               placeholder="Например: интересует актуальная стоимость, условия доставки..." 
               className={styles.textarea}
             />
           </div>

           {/* Согласие */}
           <div className={styles.formGroupCheckbox}>
            <input
              type="checkbox"
              id="privacyPolicyEqForm"
              name="isPrivacyPolicyAccepted" 
              checked={isPrivacyPolicyAccepted}
              onChange={(e) => setIsPrivacyPolicyAccepted(e.target.checked)}
              required 
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