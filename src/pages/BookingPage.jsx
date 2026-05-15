import { useEffect, useState } from 'react';
import Modal from '../components/Modal.jsx';
import { useI18n } from '../i18n.jsx';

export default function BookingPage() {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: '',
    department: '',
    student_id: '',
    booking_date: '',
    start_time: '',
  });
  const [capacity, setCapacity] = useState({ remaining: null, max: 5 });
  const [capacityError, setCapacityError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/get-count');
        if (!res.ok) throw new Error('network');
        const data = await res.json();
        if (!cancelled) {
          setCapacity({ remaining: data.remaining, max: data.max });
          setCapacityError(false);
        }
      } catch {
        if (!cancelled) setCapacityError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'student_id') v = v.toUpperCase();
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const minTime = () => {
    if (form.booking_date === today) {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    }
    return '08:00';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) {
      setModal({ message: t('booking.duplicate_submit') });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      const code = data.code || 'UNKNOWN_ERROR';
      if (data.status === 'success') {
        const detail = [
          t('msg.BOOKING_SUCCESS'),
          '',
          `${t('booking.name')}: ${form.name}`,
          `${t('booking.department')}: ${form.department}`,
          `${t('booking.student_id')}: ${form.student_id}`,
          `${t('booking.date')}: ${form.booking_date}`,
          `${t('booking.time')}: ${form.start_time}`,
        ].join('\n');
        setModal({ message: detail });
        setForm({ name: '', department: '', student_id: '', booking_date: '', start_time: '' });
      } else {
        setModal({ message: t(`msg.${code}`) });
      }
    } catch {
      setModal({ message: t('booking.network_error') });
    } finally {
      setSubmitting(false);
    }
  };

  const full = capacity.remaining !== null && capacity.remaining <= 0;
  const disabled = submitting || capacityError || full;
  const btnLabel = submitting
    ? t('booking.submitting')
    : capacityError
    ? t('booking.system_error')
    : full
    ? t('booking.full')
    : t('booking.submit');

  const renderCapacity = () => {
    if (capacityError) {
      return <div className="capacity error">{t('booking.capacity.error')}</div>;
    }
    if (capacity.remaining === null) {
      return <div className="capacity loading">{t('booking.capacity.loading')}</div>;
    }
    return (
      <div className="capacity">
        <span>{t('booking.capacity')}</span>
        <span className="capacity-value">
          <strong>{capacity.remaining}</strong> / {capacity.max}
        </span>
      </div>
    );
  };

  return (
    <div className="container">
      <h2>{t('booking.title')}</h2>
      {renderCapacity()}

      <form onSubmit={handleSubmit}>
        <label>{t('booking.name')}</label>
        <input
          type="text"
          name="name"
          placeholder={t('placeholder.name')}
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>{t('booking.department')}</label>
        <input
          type="text"
          name="department"
          placeholder={t('placeholder.department')}
          value={form.department}
          onChange={handleChange}
          required
        />

        <label>{t('booking.student_id')}</label>
        <input
          type="text"
          name="student_id"
          placeholder={t('placeholder.student_id')}
          maxLength={8}
          value={form.student_id}
          onChange={handleChange}
          required
        />

        <label>{t('booking.date')}</label>
        <input
          type="date"
          name="booking_date"
          min={today}
          value={form.booking_date}
          onChange={handleChange}
          required
        />

        <label>{t('booking.time')}</label>
        <input
          type="time"
          name="start_time"
          min={minTime()}
          max="18:00"
          value={form.start_time}
          onChange={handleChange}
          required
        />

        <button type="submit" className="primary" disabled={disabled}>
          {btnLabel}
        </button>
      </form>

      {modal && (
        <Modal
          message={modal.message}
          confirmText={t('modal.ok')}
          onConfirm={() => setModal(null)}
        />
      )}
    </div>
  );
}
