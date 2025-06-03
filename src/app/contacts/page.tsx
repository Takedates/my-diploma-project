'use client';

import React, { useState } from 'react';
import styles from './contacts.module.css';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

// --- Анимации ---
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

export default function ContactsPage() {
  const companyDetails = {
    name: 'ООО «Бизнес-Партнер»',
    address: '650000, Кемеровская область – Кузбасс, г. Кемерово, ул. Красноармейская, д. 140',
    phone: '+7 (950) 591-18-38',
    email: 'business-partner-ru@mail.ru',
    hours: 'Пн-Пт: 9:00 - 18:00',
  };

  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [phoneValue, setPhoneValue] = useState('+7');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    let digits = value.replace(/\D/g, '');

    if (!digits.startsWith('7')) {
        digits = '7' + digits;
    }
    digits = digits.substring(0, 11);

    let formattedValue = '+7';
    if (digits.length > 1) {
        formattedValue += ` (${digits.substring(1, 4)}`;
    }
    if (digits.length > 4) {
        formattedValue += `) ${digits.substring(4, 7)}`;
    }
    if (digits.length > 7) {
        formattedValue += `-${digits.substring(7, 9)}`;
    }
    if (digits.length > 9) {
        formattedValue += `-${digits.substring(9, 11)}`;
    }

    setPhoneValue(formattedValue);
  };

   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus('submitting');
    setFormError(null);

    if (!supabase) {
        setFormError("Ошибка конфигурации. Не удалось подключиться к базе данных.");
        setFormStatus('error');
        return;
     }

    const formData = new FormData(event.currentTarget);
    const name = (formData.get('name') as string)?.trim() || '';
    const phone = phoneValue.replace(/\D/g, '');
    const email = (formData.get('email') as string)?.trim() || '';
    const message = (formData.get('message') as string)?.trim() || '';
    const isPrivacyPolicyAccepted = formData.get('isPrivacyPolicyAccepted') === 'on';

    // --- Валидация ---
    if (!name) { setFormError('Пожалуйста, укажите ваше ФИО.'); setFormStatus('error'); return; }
    if (name.length < 2) { setFormError('ФИО должно содержать не менее 2 символов.'); setFormStatus('error'); return; }

    const forbiddenCharsRegex = /[0-9a-zA-Z]/;
    if (forbiddenCharsRegex.test(name)) {
        setFormError('ФИО может содержать только русские буквы, пробелы и дефисы.');
        setFormStatus('error');
        return;
    }

    if (!phone || phone.length !== 11 || !/^7\d{10}$/.test(phone)) {
        setFormError('Пожалуйста, укажите корректный контактный телефон в формате +7XXXXXXXXXX.');
        setFormStatus('error');
        return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@.]+$/.test(email)) {
        setFormError('Некорректный формат Email.');
        setFormStatus('error');
        return;
    }

    if (!message) { setFormError('Пожалуйста, введите ваше сообщение.'); setFormStatus('error'); return; }
    if (!isPrivacyPolicyAccepted) { setFormError('Необходимо согласие на обработку персональных данных.'); setFormStatus('error'); return; }
    // --- Конец Валидации ---

    let contactInfoString = `Телефон: +${phone}`;
    if (email) {
        contactInfoString += `, Email: ${email}`;
    }

    const insertData = { name, contact_info: contactInfoString, message, status: 'new' };

    console.log('[Contacts Form] Attempting to insert data:', JSON.stringify(insertData, null, 2));

    try {
      const { error } = await supabase.from('contact_requests').insert([insertData]);
      if (error) throw error;
      setFormStatus('success');
      (event.target as HTMLFormElement).reset();
      setPhoneValue('+7');
      setFormError(null);

    } catch (error: unknown) {
        console.error('Ошибка отправки контактной формы:', error);
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка.';
        setFormError(`Не удалось отправить сообщение. Ошибка: ${errorMessage}`);
        setFormStatus('error');
    }
  };

  return (
    <>
      <div className={styles.contactsContainer}>
        <motion.div className={styles.pageHeader} initial="hidden" animate="visible" variants={fadeInUp}>
           <h1 className={styles.pageTitle}>Свяжитесь с нами</h1>
           <p className={styles.pageSubtitle}>Мы всегда готовы ответить на ваши вопросы и обсудить потребности вашего бизнеса.</p>
        </motion.div>

        <motion.div
            className={styles.contentGrid}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
         >
          {/* Контактная информация */}
          <motion.div className={styles.leftColumn} variants={fadeInUp}>
             <div className={styles.contactInfo}>
                <h2 className={styles.infoTitle}>Контактная информация</h2>
                <div className={styles.infoItem}> <MapPinIcon className={styles.infoIcon} /> <span>{companyDetails.address}</span> </div>
                <div className={styles.infoItem}> <PhoneIcon className={styles.infoIcon} /> <a href={`tel:${companyDetails.phone.replace(/\D/g,'').replace(/^\+/, '')}`}>{companyDetails.phone}</a> </div>
                <div className={styles.infoItem}> <EnvelopeIcon className={styles.infoIcon} /> <a href={`mailto:${companyDetails.email}`}>{companyDetails.email}</a> </div>
                <div className={styles.infoItem}> <ClockIcon className={styles.infoIcon} /> <span><strong>Часы работы:</strong><br/>{companyDetails.hours}</span> </div>
             </div>
          </motion.div>

          {/* Форма */}
          <motion.div className={styles.rightColumn} variants={fadeInUp}>
             <h2 className={styles.formTitle}>Отправить сообщение</h2>
             <form onSubmit={handleSubmit} className={styles.contactForm}>
                {/*ФИО */}
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>Ваше ФИО*</label>
                  <input type="text" id="name" name="name" required className={styles.formInput} disabled={formStatus === 'submitting'} placeholder="Иванов Иван Иванович" />
                </div>
                {/* Email */}
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>Email</label>
                  <input type="email" id="email" name="email" className={styles.formInput} disabled={formStatus === 'submitting'} placeholder="example@mail.ru" />
                </div>
                {/* Телефон  */}
                 <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.formLabel}>Контактный телефон*</label>
                  <input type="tel" id="phone" name="phone" value={phoneValue} onChange={handlePhoneChange} className={styles.formInput} disabled={formStatus === 'submitting'} placeholder="+7 (XXX) XXX-XX-XX" maxLength={18} />
                </div>
                {/* Сообщение */}
                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>Сообщение*</label>
                  <textarea id="message" name="message" rows={5} required className={styles.formTextarea} disabled={formStatus === 'submitting'} placeholder="Опишите ваш вопрос или причину обращения..."></textarea>
                </div>
                 {/* Согласие на обработку ПДн */}
                <div className={styles.formGroupCheckbox}>
                    <input type="checkbox" id="privacyPolicy" name="isPrivacyPolicyAccepted" required disabled={formStatus === 'submitting'} className={styles.formCheckbox} />
                    <label htmlFor="privacyPolicy" className={styles.checkboxLabel}>
                        Я даю свое согласие на обработку персональных данных и принимаю условия{' '}
                        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={styles.privacyLink}> Политики конфиденциальности </a>*
                    </label>
                </div>

                {/* Статус отправки */}
                {formStatus === 'error' && (<p className={styles.errorMessage}>{formError}</p>)}
                {formStatus === 'success' && (<p className={styles.successMessage}>Спасибо! Ваше сообщение успешно отправлено.</p>)}

                {/* Кнопка и сноска */}
                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitButton} disabled={formStatus === 'submitting'}>
                    {formStatus === 'submitting' ? 'Отправка...' : 'Отправить'}
                  </button>
                  <small className={styles.requiredNote}>* - Обязательные для заполнения поля</small>
                </div>
             </form>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}