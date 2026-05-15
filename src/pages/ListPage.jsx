import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal.jsx';
import { useI18n } from '../i18n.jsx';

export default function ListPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/list');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRows(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(id);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.name} ${r.department} ${r.student_id}`.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const handleReturn = async (id, name) => {
    setConfirm(null);
    try {
      const res = await fetch(`/api/return?id=${id}`, { method: 'POST' });
      if (!res.ok) throw new Error();
      setToast(t('list.return.success', { name }));
      await load();
    } catch {
      alert(t('list.return.error'));
    }
  };

  const formatMd = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="list-wrapper">
      <h2>{t('list.title')}</h2>

      <div id="searchWrapper">
        <input
          type="text"
          placeholder={t('list.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? (
        <div className="emptyMessage">{t('list.error')}</div>
      ) : loading ? (
        <div className="emptyMessage">{t('list.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="emptyMessage">{rows.length === 0 ? t('list.empty') : t('list.no_match')}</div>
      ) : (
        <table className="booking-table">
          <thead>
            <tr>
              <th>{t('list.col.name')}</th>
              <th>{t('list.col.department')}</th>
              <th>{t('list.col.student_id')}</th>
              <th>{t('list.col.date')}</th>
              <th>{t('list.col.time')}</th>
              <th>{t('list.col.action')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td data-label={t('list.col.name')}>{row.name}</td>
                <td data-label={t('list.col.department')}>{row.department}</td>
                <td data-label={t('list.col.student_id')}>{row.student_id}</td>
                <td data-label={t('list.col.date')}>{formatMd(row.booking_date)}</td>
                <td data-label={t('list.col.time')}>{(row.start_time || '').slice(0, 5)}</td>
                <td className="action-cell">
                  <button
                    className="returnBtn"
                    onClick={() => setConfirm({ id: row.id, name: row.name })}
                  >
                    {t('list.return')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {confirm && (
        <Modal
          message={t('list.return.message', { name: confirm.name })}
          confirmText={t('list.return.confirm')}
          cancelText={t('list.return.cancel')}
          onConfirm={() => handleReturn(confirm.id, confirm.name)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
