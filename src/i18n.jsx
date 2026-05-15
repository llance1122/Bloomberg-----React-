import { createContext, useContext, useEffect, useState } from 'react';

const translations = {
  zh: {
    'nav.booking': '借用申請',
    'nav.list': '借用清單',
    'lang.switch': 'EN',

    'booking.title': 'Bloomberg 借用表單',
    'booking.capacity': '目前可用台數',
    'booking.capacity.loading': '載入中...',
    'booking.capacity.error': '⚠️ 無法取得剩餘台數',
    'booking.name': '姓名',
    'booking.department': '系所',
    'booking.student_id': '學號',
    'booking.date': '借用日期',
    'booking.time': '開始時間',
    'booking.submit': '送出申請',
    'booking.submitting': '送出中...',
    'booking.full': '已額滿',
    'booking.system_error': '系統異常',
    'booking.duplicate_submit': '請勿重複送出',
    'booking.network_error': '❌ 送出失敗，請稍後再試',
    'placeholder.name': '呂岳樺',
    'placeholder.department': '資管四甲',
    'placeholder.student_id': 'B1044127',

    'msg.BOOKING_SUCCESS': '✅ 借用成功！',
    'msg.BOOKING_FULL': '❌ 目前已額滿，無法借用',
    'msg.BOOKING_DUPLICATE': '❌ 您有尚未歸還的借用紀錄，請先歸還後再借用。',
    'msg.INVALID_FORMAT': '❌ 時間格式錯誤',
    'msg.EMPTY_FIELDS': '❌ 欄位不可空白',
    'msg.UNKNOWN_ERROR': '❌ 發生錯誤，請稍後再試',

    'list.title': '借用清單（今日）',
    'list.search': '搜尋姓名 / 學號 / 系所...',
    'list.empty': '今日目前無人借用',
    'list.no_match': '查無符合的紀錄',
    'list.loading': '載入中...',
    'list.error': '⚠️ 無法載入資料，請稍後再試',
    'list.col.name': '姓名',
    'list.col.department': '系所',
    'list.col.student_id': '學號',
    'list.col.date': '日期',
    'list.col.time': '時間',
    'list.col.action': '操作',
    'list.return': '歸還',
    'list.return.confirm': '確認歸還',
    'list.return.cancel': '取消',
    'list.return.message': '確認歸還 {name} 的借用？',
    'list.return.success': '✅ 已歸還 {name}',
    'list.return.error': '❌ 歸還失敗，請稍後再試',

    'modal.ok': '確認',
  },
  en: {
    'nav.booking': 'Book',
    'nav.list': 'List',
    'lang.switch': '中',

    'booking.title': 'Bloomberg Terminal Booking',
    'booking.capacity': 'Available terminals',
    'booking.capacity.loading': 'Loading...',
    'booking.capacity.error': '⚠️ Cannot fetch availability',
    'booking.name': 'Name',
    'booking.department': 'Department',
    'booking.student_id': 'Student ID',
    'booking.date': 'Date',
    'booking.time': 'Start Time',
    'booking.submit': 'Submit',
    'booking.submitting': 'Submitting...',
    'booking.full': 'Full',
    'booking.system_error': 'System error',
    'booking.duplicate_submit': 'Please do not double-submit',
    'booking.network_error': '❌ Submission failed, please try again',
    'placeholder.name': 'John Doe',
    'placeholder.department': 'FIN Senior',
    'placeholder.student_id': 'B1044127',

    'msg.BOOKING_SUCCESS': '✅ Booking confirmed!',
    'msg.BOOKING_FULL': '❌ All terminals are currently in use',
    'msg.BOOKING_DUPLICATE': '❌ You have an unreturned booking. Please return it first.',
    'msg.INVALID_FORMAT': '❌ Invalid date/time format',
    'msg.EMPTY_FIELDS': '❌ All fields are required',
    'msg.UNKNOWN_ERROR': '❌ Unexpected error, please try again',

    'list.title': "Today's Bookings",
    'list.search': 'Search by name / ID / department...',
    'list.empty': 'No active bookings today',
    'list.no_match': 'No matching records',
    'list.loading': 'Loading...',
    'list.error': '⚠️ Cannot load data, please try again',
    'list.col.name': 'Name',
    'list.col.department': 'Department',
    'list.col.student_id': 'Student ID',
    'list.col.date': 'Date',
    'list.col.time': 'Time',
    'list.col.action': 'Action',
    'list.return': 'Return',
    'list.return.confirm': 'Confirm Return',
    'list.return.cancel': 'Cancel',
    'list.return.message': 'Confirm return for {name}?',
    'list.return.success': '✅ Returned for {name}',
    'list.return.error': '❌ Return failed, please try again',

    'modal.ok': 'OK',
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('lang');
    return saved === 'en' || saved === 'zh' ? saved : 'zh';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';
  }, [lang]);

  const t = (key, vars) => {
    let s = translations[lang][key] ?? translations.zh[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(`{${k}}`, v);
      }
    }
    return s;
  };

  const toggle = () => setLang(lang === 'zh' ? 'en' : 'zh');

  return (
    <I18nContext.Provider value={{ lang, setLang, toggle, t }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
