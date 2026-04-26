import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { deleteTraining, fetchTrainings } from '../services/api';
import type { Training } from '../types/training';

type SortField = 'date' | 'activity' | 'duration' | 'customerName';
type SortDirection = 'asc' | 'desc';

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

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

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function getSortArrow(field: SortField) {
    if (sortField !== field) {
      return '';
    }

    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  }

  function handleOpenDeleteConfirm(trainingId: string) {
    setConfirmDeleteId(trainingId);
    setError('');
  }

  function handleCancelDelete() {
    setConfirmDeleteId(null);
  }

  async function handleConfirmDelete() {
    if (!confirmDeleteId) {
      return;
    }

    try {
      setDeleting(true);
      setError('');

      await deleteTraining(confirmDeleteId);
      await loadTrainings();
      setConfirmDeleteId(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete training');
      }
    } finally {
      setDeleting(false);
    }
  }

  const filteredTrainings = trainings.filter((training) => {
    const searchValue = searchTerm.toLowerCase().trim();

    const formattedDate = dayjs(training.date).format('DD.MM.YYYY HH:mm').toLowerCase();
    const activity = training.activity.toLowerCase();
    const customerName = training.customerName.toLowerCase();
    const duration = String(training.duration);

    return (
      formattedDate.includes(searchValue) ||
      activity.includes(searchValue) ||
      customerName.includes(searchValue) ||
      duration.includes(searchValue)
    );
  });

  const sortedTrainings = [...filteredTrainings].sort((a, b) => {
    if (sortField === 'duration') {
      return sortDirection === 'asc'
        ? a.duration - b.duration
        : b.duration - a.duration;
    }

    if (sortField === 'date') {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();

      return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
    }

    const valueA = a[sortField].toLowerCase();
    const valueB = b[sortField].toLowerCase();

    if (valueA < valueB) {
      return sortDirection === 'asc' ? -1 : 1;
    }

    if (valueA > valueB) {
      return sortDirection === 'asc' ? 1 : -1;
    }

    return 0;
  });

  return (
    <section className="page-section">
      <div className="page-header-row">
        <h2>Trainings</h2>

        <input
          type="text"
          placeholder="Search trainings..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="search-input"
        />
      </div>

      {confirmDeleteId && (
        <div className="confirm-box">
          <p>Delete this training?</p>

          <div className="confirm-actions">
            <button
              type="button"
              className="danger-button"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Yes, delete'}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleCancelDelete}
              disabled={deleting}
            >
              No, cancel
            </button>
          </div>
        </div>
      )}

      {loading && <p>Loading trainings...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <p className="results-text">Trainings found: {sortedTrainings.length}</p>

          <div className="table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('date')}>
                    Date{getSortArrow('date')}
                  </th>
                  <th onClick={() => handleSort('activity')}>
                    Activity{getSortArrow('activity')}
                  </th>
                  <th onClick={() => handleSort('duration')}>
                    Duration{getSortArrow('duration')}
                  </th>
                  <th onClick={() => handleSort('customerName')}>
                    Customer{getSortArrow('customerName')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedTrainings.map((training) => (
                  <tr key={training.id}>
                    <td>{dayjs(training.date).format('DD.MM.YYYY HH:mm')}</td>
                    <td>{training.activity}</td>
                    <td>{training.duration} min</td>
                    <td>{training.customerName}</td>
                    <td className="actions-cell">
                      <button
                        type="button"
                        className="table-delete-button"
                        onClick={() => handleOpenDeleteConfirm(training.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}