import { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchTrainings } from '../services/api';
import type { Training } from '../types/training';

type ActivityStat = {
  activity: string;
  minutes: number;
};

export default function StatisticsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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

  const chartData: ActivityStat[] = useMemo(() => {
    const totals: Record<string, number> = {};

    for (const training of trainings) {
      const activity = training.activity.trim();

      if (!activity) {
        continue;
      }

      if (!totals[activity]) {
        totals[activity] = 0;
      }

      totals[activity] += training.duration;
    }

    return Object.entries(totals)
      .map(([activity, minutes]) => ({
        activity,
        minutes,
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [trainings]);

  return (
    <section className="page-section">
      <div className="page-header-row">
        <h2>Statistics</h2>
      </div>

      {loading && <p>Loading statistics...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <p className="results-text">
            Total activities shown: {chartData.length}
          </p>

          <div className="stats-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 16, right: 24, left: 8, bottom: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="activity" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minutes" name="Minutes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}