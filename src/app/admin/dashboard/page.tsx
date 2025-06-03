'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from './dashboard.module.css';
import Link from 'next/link';

// --- ТИПЫ ---
type User = { id: string; email?: string; } | null;
type RequestStatus = 'new' | 'in_progress' | 'closed';
type SortOrder = 'asc' | 'desc';
type ContactSortColumn = 'created_at' | 'name' | 'status';


type EquipmentSortColumn = 'created_at' | 'name' | 'equipment_name' | 'status'; 

interface ContactRequest { id: number; created_at: string; name: string; contact_info: string; message: string; status: RequestStatus | string | null; }


interface EquipmentRequest {
    id: number;
    created_at: string;
    name: string; 
    contact_info: string;
    equipment_name?: string | null;
    equipment_link?: string | null;
    request_type: string;
    message?: string | null;
    status: RequestStatus | string | null;
}

// --- КОНСТАНТЫ ---
const STATUS_OPTIONS: RequestStatus[] = ['new', 'in_progress', 'closed'];
const ITEMS_PER_PAGE = 10;
const statusDisplayNames: Record<RequestStatus | 'all', string> = { all: 'Все статусы', new: 'Новая', in_progress: 'В работе', closed: 'Закрыта' };
const FILTER_STATUS_OPTIONS: (RequestStatus | 'all')[] = ['all', ...STATUS_OPTIONS];

// --- Компонент стрелок сортировки ---
const SortIndicator: React.FC<{ order?: SortOrder }> = ({ order }) => {
    if (!order) return null;
    return <span className={styles.sortIndicator}>{order === 'asc' ? '▲' : '▼'}</span>;
};

// --- Основной Компонент ---
export default function DashboardPage() {
    const router = useRouter();
    // Состояния аутентификации и данных
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true); // Общая загрузка страницы
    const [error, setError] = useState<string | null>(null); // Ошибка авторизации
    const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
    const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(true); // Загрузка самих заявок
    const [requestsError, setRequestsError] = useState<string | null>(null); // Ошибка загрузки заявок
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    // Состояния пагинации
    const [contactCurrentPage, setContactCurrentPage] = useState(1);
    const [contactTotalCount, setContactTotalCount] = useState(0);
    const contactTotalPages = Math.ceil(contactTotalCount / ITEMS_PER_PAGE);
    const [equipmentCurrentPage, setEquipmentCurrentPage] = useState(1);
    const [equipmentTotalCount, setEquipmentTotalCount] = useState(0);
    const equipmentTotalPages = Math.ceil(equipmentTotalCount / ITEMS_PER_PAGE);

    // Состояния фильтров и поиска
    const [contactFilterStatus, setContactFilterStatus] = useState<RequestStatus | 'all'>('all');
    const [contactSearchTerm, setContactSearchTerm] = useState('');
    const [contactSearchInput, setContactSearchInput] = useState('');
    const [equipmentFilterStatus, setEquipmentFilterStatus] = useState<RequestStatus | 'all'>('all');
    const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('');
    const [equipmentSearchInput, setEquipmentSearchInput] = useState('');

    // Состояния для сортировки
    const [contactSortBy, setContactSortBy] = useState<ContactSortColumn>('created_at');
    const [contactSortOrder, setContactSortOrder] = useState<SortOrder>('desc');
    const [equipmentSortBy, setEquipmentSortBy] = useState<EquipmentSortColumn>('created_at');
    const [equipmentSortOrder, setEquipmentSortOrder] = useState<SortOrder>('desc');


    // --- Проверка авторизации ---
    useEffect(() => {
        const checkUser = async () => {
            if (!supabase) {
                console.error("Supabase client not initialized during auth check.");
                setError("Клиент Supabase не инициализирован.");
                setLoading(false);
                return;
            }
            setError(null);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push('/login');
                    return;
                }
                setUser(session.user);
            } catch (sessionError: unknown) {
                console.error("Ошибка авторизации:", sessionError);
                const errorMessage = sessionError instanceof Error ? sessionError.message : String(sessionError);
                setError("Ошибка авторизации: " + errorMessage);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, [router]);

    // --- Загрузка заявок (ЗАВИСИМЫЙ useEffect) ---
    useEffect(() => {
        if (!user) { 
            if (!loading) { 
               setLoadingRequests(false);
            }
            return;
        };

        const fetchRequests = async () => {
            if (!supabase) {
                console.error("Supabase client not available for fetching requests.");
                setRequestsError("Клиент Supabase недоступен для загрузки заявок.");
                setLoadingRequests(false);
                return;
            }

            console.log('Fetching requests with filters:', { contactFilterStatus, equipmentFilterStatus, contactSearchTerm, equipmentSearchTerm });

            setLoadingRequests(true);
            setRequestsError(null);
            const cFrom = (contactCurrentPage - 1) * ITEMS_PER_PAGE, cTo = cFrom + ITEMS_PER_PAGE - 1;
            const eqFrom = (equipmentCurrentPage - 1) * ITEMS_PER_PAGE, eqTo = eqFrom + ITEMS_PER_PAGE - 1;

            try {
                let cQuery = supabase.from('contact_requests').select('*', { count: 'exact' });
                if (contactFilterStatus !== 'all') cQuery = cQuery.eq('status', contactFilterStatus);
                if (contactSearchTerm.trim()) cQuery = cQuery.or(`name.ilike.%${contactSearchTerm.trim()}%,contact_info.ilike.%${contactSearchTerm.trim()}%`);
                cQuery = cQuery.order(contactSortBy, { ascending: contactSortOrder === 'asc' }).range(cFrom, cTo);


                let eqQuery = supabase.from('equipment_requests').select('*', { count: 'exact' });
                if (equipmentFilterStatus !== 'all') eqQuery = eqQuery.eq('status', equipmentFilterStatus);

                if (equipmentSearchTerm.trim()) eqQuery = eqQuery.or(`name.ilike.%${equipmentSearchTerm.trim()}%,contact_info.ilike.%${equipmentSearchTerm.trim()}%`, { foreignTable: 'equipment_requests' }); 
                eqQuery = eqQuery.order(equipmentSortBy, { ascending: equipmentSortOrder === 'asc' }).range(eqFrom, eqTo);

                const [cRes, eqRes] = await Promise.all([cQuery, eqQuery]);
                const { data: cData, error: cErr, count: cCount } = cRes;
                const { data: rawEqData, error: eqErr, count: eqCount } = eqRes;
                

                const eqData = rawEqData as EquipmentRequest[] || [];


                const errors: string[] = [];
                if (cErr) { console.error("Ошибка contact_requests:", cErr); errors.push(`Ошибка загрузки заявок контактов: ${cErr.message}`); }
                setContactRequests(cData || []); setContactTotalCount(cCount ?? 0);
                if (eqErr) { console.error("Ошибка equipment_requests:", eqErr); errors.push(`Ошибка загрузки заявок на технику: ${eqErr.message}`); }
                setEquipmentRequests(eqData); setEquipmentTotalCount(eqCount ?? 0);

                if (errors.length > 0) setRequestsError(errors.join('\n'));

            } catch (fetchError: unknown) {
                 console.error("Общая ошибка fetchRequests:", fetchError);
                 const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
                 setRequestsError(`Общая ошибка загрузки заявок: ${errorMessage}`);
            } finally {
                setLoadingRequests(false);
            }
        };

        fetchRequests();

    }, [
        user,
        contactCurrentPage, equipmentCurrentPage,
        contactFilterStatus, contactSearchTerm,
        equipmentFilterStatus, equipmentSearchTerm,
        contactSortBy, contactSortOrder,
        equipmentSortBy, equipmentSortOrder,
        loading
    ]);


    // --- Debounce эффекты для поиска ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setContactSearchTerm(contactSearchInput);
            setContactCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [contactSearchInput]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setEquipmentSearchTerm(equipmentSearchInput);
            setEquipmentCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [equipmentSearchInput]);


    // --- Функция выхода ---
   const handleLogout = async () => {
       if (!supabase) {
           setError("Клиент Supabase не инициализирован. Выход невозможен.");
           console.error("Supabase client not initialized during logout.");
           return;
       };
       setLoading(true);
       const { error: signOutError } = await supabase.auth.signOut();
       setUser(null);
       setLoading(false);
       if (signOutError) {
           console.error('Ошибка выхода:', signOutError);
           setError("Не удалось выйти: " + signOutError.message);
       }
       router.push('/login');
   };

   // --- Функция смены статуса ---
   const handleStatusChange = async (requestId: number, newStatusValue: string, requestType: 'contact' | 'equipment') => {
     if (!supabase) { // Явная проверка supabase
         console.error("Supabase client not initialized. Cannot update status.");
         setRequestsError("Клиент Supabase не инициализирован. Обновление статуса невозможно.");
         return;
     }

     const newStatus = STATUS_OPTIONS.find(s => s === newStatusValue);
     if (!newStatus) {
         console.error("Выбран невалидный статус:", newStatusValue);
         setRequestsError(`Не удалось обновить статус: Невалидный статус '${newStatusValue}'`);
         return;
     }

     setUpdatingStatusId(requestId);
     setRequestsError(null);
     const tableName = requestType === 'contact' ? 'contact_requests' : 'equipment_requests';
     try {
       const { error: updateError } = await supabase
         .from(tableName)
         .update({ status: newStatus })
         .eq('id', requestId);

       if (updateError) throw updateError;

       if (requestType === 'contact') {
           setContactRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req ));
       } else {
           setEquipmentRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req ));
       }
     } catch (error: unknown) {
        console.error(`Ошибка обновления статуса для ${tableName}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setRequestsError(`Не удалось обновить статус заявки #${requestId}: ${errorMessage}`);
     } finally {
       setUpdatingStatusId(null);
     }
   };

    const handleContactPageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= contactTotalPages && newPage !== contactCurrentPage) {
            setContactCurrentPage(newPage);
        }
    };
    const handleEquipmentPageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= equipmentTotalPages && newPage !== equipmentCurrentPage) {
            setEquipmentCurrentPage(newPage);
        }
    };

    const handleContactFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setContactFilterStatus(e.target.value as RequestStatus | 'all');
        setContactCurrentPage(1);
    };
    const handleContactSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setContactSearchInput(e.target.value); };
    const handleEquipmentFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEquipmentFilterStatus(e.target.value as RequestStatus | 'all');
        setEquipmentCurrentPage(1);
    };
    const handleEquipmentSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setEquipmentSearchInput(e.target.value); };


    const handleSort = ( tableType: 'contact' | 'equipment', column: ContactSortColumn | EquipmentSortColumn ) => {
        if (tableType === 'contact') {
            const typedColumn = column as ContactSortColumn;
            const newSortOrder = contactSortBy === typedColumn && contactSortOrder === 'asc' ? 'desc' : 'asc';
            setContactSortBy(typedColumn);
            setContactSortOrder(newSortOrder);
            setContactCurrentPage(1);
        } else {
            // ИСПРАВЛЕНО: Сортировка по 'name'
            const newSortOrder = equipmentSortBy === column && equipmentSortOrder === 'asc' ? 'desc' : 'asc';
            setEquipmentSortBy(column as EquipmentSortColumn); 
            setEquipmentSortOrder(newSortOrder);
            setEquipmentCurrentPage(1);
        }
    };

    if (loading) return <div className={styles.loading}>Проверка авторизации...</div>;
    if (error || !user) return ( <div className={styles.errorContainer}><p className={styles.errorMessage}>{error || 'Доступ запрещен. Пожалуйста, войдите.'}</p><Link href="/login" className={styles.loginLink}> Перейти на страницу входа </Link></div> );

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Панель управления заявками</h1>
                <div className={styles.userInfo}>
                    <span>Вы вошли как: {user.email ?? 'Email не определен'}</span>
                    <button onClick={handleLogout} className={styles.logoutButton} disabled={!supabase || updatingStatusId !== null || loadingRequests}>
                        Выйти
                    </button>
                </div>
            </div>
            {requestsError && <p className={styles.errorMessage}>{requestsError}</p>}

            <div className={styles.requestsSection}>
                <h2 className={styles.sectionTitle}>Заявки из формы контактов</h2>
                <div className={styles.controlsPanel}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="contact-status-filter">Фильтр по статусу:</label>
                        <select id="contact-status-filter" value={contactFilterStatus} onChange={handleContactFilterChange} className={styles.filterSelect} disabled={loadingRequests}>
                            {FILTER_STATUS_OPTIONS.map(status => (<option key={status} value={status}>{statusDisplayNames[status]}</option>))}
                        </select>
                    </div>
                    <div className={styles.searchGroup}>
                        <label htmlFor="contact-search">Поиск:</label>
                        <input type="search" id="contact-search" placeholder="Имя или контакт..." value={contactSearchInput} onChange={handleContactSearchChange} className={styles.searchInput} disabled={loadingRequests}/>
                    </div>
                </div>
                {loadingRequests && !requestsError ? (<div className={styles.loading}>Загрузка заявок...</div>) :
                 !requestsError && contactRequests.length > 0 ? (
                  <>
                    <div className={styles.tableWrapper}>
                        <table className={styles.requestsTable}>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('contact', 'created_at')} className={styles.sortableHeader}>Дата <SortIndicator order={contactSortBy === 'created_at' ? contactSortOrder : undefined} /></th>
                                    <th onClick={() => handleSort('contact', 'name')} className={styles.sortableHeader}>Имя <SortIndicator order={contactSortBy === 'name' ? contactSortOrder : undefined} /></th>
                                    <th>Контакт</th>
                                    <th>Сообщение</th>
                                    <th onClick={() => handleSort('contact', 'status')} className={styles.sortableHeader}>Статус <SortIndicator order={contactSortBy === 'status' ? contactSortOrder : undefined} /></th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contactRequests.map(req => {
                                    const statusText = req.status ? statusDisplayNames[req.status as RequestStatus] || req.status : 'N/A';
                                    const statusClass = req.status ? styles[`status_${req.status.replace('-', '_')}`] || '' : '';
                                    const rowStatusClass = req.status ? styles[`rowStatus_${req.status.replace('-', '_')}`] || '' : '';
                                    return (
                                        <tr key={req.id} className={`${rowStatusClass} ${updatingStatusId === req.id ? styles.rowLoading : ''}`}>
                                            <td>{new Date(req.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short'})}</td>
                                            <td>{req.name}</td>
                                            <td>{req.contact_info}</td>
                                            <td title={req.message}>{req.message}</td>
                                            <td><span className={`${styles.statusBadge} ${statusClass}`}>{statusText}</span></td>
                                            <td><select value={req.status ?? ''} onChange={(e) => handleStatusChange(req.id, e.target.value, 'contact')} disabled={updatingStatusId === req.id} className={styles.statusSelect}>
                                                {STATUS_OPTIONS.map(status => (<option key={status} value={status}>{statusDisplayNames[status]}</option> ))}
                                                {!STATUS_OPTIONS.includes(req.status as RequestStatus) && req.status && (<option value={req.status} disabled>{statusDisplayNames[req.status as RequestStatus] || req.status} (текущий)</option>)}
                                            </select></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {contactTotalPages > 1 && (
                        <div className={styles.paginationControls}>
                            <button onClick={() => handleContactPageChange(contactCurrentPage - 1)} disabled={contactCurrentPage === 1 || loadingRequests} className={styles.paginationButton}>← Назад</button>
                            <span className={styles.paginationInfo}>Страница {contactCurrentPage} из {contactTotalPages} (Всего: {contactTotalCount})</span>
                            <button onClick={() => handleContactPageChange(contactCurrentPage + 1)} disabled={contactCurrentPage === contactTotalPages || loadingRequests} className={styles.paginationButton}>Вперед →</button>
                        </div>
                    )}
                  </>
                 ) : !requestsError && !loadingRequests ? (<p className={styles.noResults}>Заявки не найдены.</p>) : null }
            </div>

            <div className={styles.requestsSection}>
                <h2 className={styles.sectionTitle}>Заявки на технику</h2>
                <div className={styles.controlsPanel}>
                     <div className={styles.filterGroup}><label htmlFor="equipment-status-filter">Фильтр по статусу:</label><select id="equipment-status-filter" value={equipmentFilterStatus} onChange={handleEquipmentFilterChange} className={styles.filterSelect} disabled={loadingRequests}>{FILTER_STATUS_OPTIONS.map(status => (<option key={status} value={status}>{statusDisplayNames[status]}</option>))}</select></div>
                     <div className={styles.searchGroup}><label htmlFor="equipment-search">Поиск:</label><input type="search" id="equipment-search" placeholder="Имя, контакт, техника..." value={equipmentSearchInput} onChange={handleEquipmentSearchChange} className={styles.searchInput} disabled={loadingRequests}/></div>
                </div>
                 {loadingRequests && !requestsError ? (<div className={styles.loading}>Загрузка заявок...</div>) :
                 !requestsError && equipmentRequests.length > 0 ? (
                    <>
                        <div className={styles.tableWrapper}>
                            <table className={styles.requestsTable}>
                                <thead>
                                    <tr>
                                        <th onClick={() => handleSort('equipment', 'created_at')} className={styles.sortableHeader}>Дата <SortIndicator order={equipmentSortBy === 'created_at' ? equipmentSortOrder : undefined} /></th>
                                        {/* Заголовок столбца для имени клиента */}
                                        <th onClick={() => handleSort('equipment', 'name')} className={styles.sortableHeader}>Имя клиента <SortIndicator order={equipmentSortBy === 'name' ? equipmentSortOrder : undefined} /></th>
                                        <th>Контакт</th>
                                        <th onClick={() => handleSort('equipment', 'equipment_name')} className={styles.sortableHeader}>Техника <SortIndicator order={equipmentSortBy === 'equipment_name' ? equipmentSortOrder : undefined} /></th>
                                        <th>Тип запроса</th>
                                        <th>Сообщение</th>
                                        <th onClick={() => handleSort('equipment', 'status')} className={styles.sortableHeader}>Статус <SortIndicator order={equipmentSortBy === 'status' ? equipmentSortOrder : undefined} /></th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipmentRequests.map(req => {
                                        const statusText = req.status ? statusDisplayNames[req.status as RequestStatus] || req.status : 'N/A';
                                        const statusClass = req.status ? styles[`status_${req.status.replace('-', '_')}`] || '' : '';
                                        const rowStatusClass = req.status ? styles[`rowStatus_${req.status.replace('-', '_')}`] || '' : '';
                                        return (
                                            <tr key={req.id} className={`${rowStatusClass} ${updatingStatusId === req.id ? styles.rowLoading : ''}`}>
                                                <td>{new Date(req.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short'})}</td>
                                                {/* выводим req.name напрямую, с запасным вариантом */}
                                                <td>{req.name || '-'}</td> 
                                                <td>{req.contact_info}</td>
                                                <td>{req.equipment_name || '-'}</td>
                                                <td>{req.request_type}</td>
                                                <td title={req.message || ''}>{req.message || '-'}</td>
                                                <td><span className={`${styles.statusBadge} ${statusClass}`}>{statusText}</span></td>
                                                <td><select value={req.status ?? ''} onChange={(e) => handleStatusChange(req.id, e.target.value, 'equipment')} disabled={updatingStatusId === req.id} className={styles.statusSelect}>
                                                    {STATUS_OPTIONS.map(status => (<option key={status} value={status}>{statusDisplayNames[status]}</option> ))}
                                                    {!STATUS_OPTIONS.includes(req.status as RequestStatus) && req.status && (<option value={req.status} disabled>{statusDisplayNames[req.status as RequestStatus] || req.status} (текущий)</option>)}
                                                </select></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {equipmentTotalPages > 1 && (
                            <div className={styles.paginationControls}>
                                <button onClick={() => handleEquipmentPageChange(equipmentCurrentPage - 1)} disabled={equipmentCurrentPage === 1 || loadingRequests} className={styles.paginationButton}>← Назад</button>
                                <span className={styles.paginationInfo}>Страница {equipmentCurrentPage} из {equipmentTotalPages} (Всего: {equipmentTotalCount})</span>
                                <button onClick={() => handleEquipmentPageChange(equipmentCurrentPage + 1)} disabled={equipmentCurrentPage === equipmentTotalPages || loadingRequests} className={styles.paginationButton}>Вперед →</button>
                            </div>
                        )}
                    </>
                 ) : !requestsError && !loadingRequests ? (<p className={styles.noResults}>Заявки не найдены.</p>) : null }
            </div>
        </div>
    );
}