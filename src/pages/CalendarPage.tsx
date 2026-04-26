import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  dayjsLocalizer,
  type Event,
  type View,
} from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchTrainings } from '../services/api';
import type { Training } from '../types/training';

const localizer = dayjsLocalizer(dayjs);

type CalendarEvent = Event & {
  resource?: string;
};

export default function CalendarPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>('month');

  async function loadTrainings() {
    try {
      setLoading(true);
      setError('');

      const data = await fetchTrainings();
      setTrainings(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrainings();
  }, []);

  const events: CalendarEvent[] = useMemo(() => {
    return trainings.map((training) => {
      const start = dayjs(training.date).toDate();
      const end = dayjs(training.date).add(training.duration, 'minute').toDate();

      return {
        title: `${training.activity} / ${training.customerName}`,
        start,
        end,
        resource: training.id,
      };
    });
  }, [trainings]);

  return (
    <section className="page-section">
      <div className="page-header-row">
        <h2>Calendar</h2>
      </div>

      {loading && <p>Loading calendar...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="calendar-wrapper">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={['month', 'week', 'day']}
            view={currentView}
            onView={(newView) => setCurrentView(newView)}
            date={currentDate}
            onNavigate={(newDate) => setCurrentDate(newDate)}
            toolbar={true}
            step={30}
            style={{ height: '100%' }}
          />
        </div>
      )}
    </section>
  );
}