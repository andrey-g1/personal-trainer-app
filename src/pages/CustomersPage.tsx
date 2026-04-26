import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  addCustomer,
  addTraining,
  deleteCustomer,
  fetchCustomers,
  updateCustomer,
} from '../services/api';
import type { Customer } from '../types/customer';

type SortField =
  | 'firstname'
  | 'lastname'
  | 'streetaddress'
  | 'postcode'
  | 'city'
  | 'email'
  | 'phone';

type SortDirection = 'asc' | 'desc';

type CustomerFormData = Omit<Customer, 'id'>;
type FormMode = 'add' | 'edit' | null;

const emptyForm: CustomerFormData = {
  firstname: '',
  lastname: '',
  streetaddress: '',
  postcode: '',
  city: '',
  email: '',
  phone: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('firstname');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>(emptyForm);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [trainingCustomer, setTrainingCustomer] = useState<Customer | null>(null);
  const [trainingDate, setTrainingDate] = useState<Date | null>(new Date());
  const [trainingActivity, setTrainingActivity] = useState<string>('');
  const [trainingDuration, setTrainingDuration] = useState<string>('');
  const [trainingSubmitting, setTrainingSubmitting] = useState<boolean>(false);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError('');

      const data = await fetchCustomers();
      setCustomers(data);
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
    loadCustomers();
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

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleCancelTrainingForm() {
    setTrainingCustomer(null);
    setTrainingDate(new Date());
    setTrainingActivity('');
    setTrainingDuration('');
  }

  function handleOpenAddForm() {
    handleCancelTrainingForm();
    setFormMode('add');
    setEditingCustomerId(null);
    setFormData(emptyForm);
    setError('');
  }

  function handleOpenEditForm(customer: Customer) {
    handleCancelTrainingForm();
    setFormMode('edit');
    setEditingCustomerId(customer.id);
    setFormData({
      firstname: customer.firstname,
      lastname: customer.lastname,
      streetaddress: customer.streetaddress,
      postcode: customer.postcode,
      city: customer.city,
      email: customer.email,
      phone: customer.phone,
    });
    setError('');
  }

  function handleCancelForm() {
    setFormMode(null);
    setEditingCustomerId(null);
    setFormData(emptyForm);
  }

  function handleOpenDeleteConfirm(customerId: string) {
    setConfirmDeleteId(customerId);
    setError('');
  }

  function handleCancelDelete() {
    setConfirmDeleteId(null);
  }

  function handleOpenTrainingForm(customer: Customer) {
    handleCancelForm();
    setConfirmDeleteId(null);
    setTrainingCustomer(customer);
    setTrainingDate(new Date());
    setTrainingActivity('');
    setTrainingDuration('');
    setError('');
  }

  function escapeCsvValue(value: string) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  function handleExportCsv() {
    const headers = [
      'First name',
      'Last name',
      'Street address',
      'Postcode',
      'City',
      'Email',
      'Phone',
    ];

    const rows = customers.map((customer) => [
      customer.firstname,
      customer.lastname,
      customer.streetaddress,
      customer.postcode,
      customer.city,
      customer.email,
      customer.phone,
    ]);

    const csvContent = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) => row.map(escapeCsvValue).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers.csv';
    link.click();

    URL.revokeObjectURL(url);
  }

  async function handleConfirmDelete() {
    if (!confirmDeleteId) {
      return;
    }

    try {
      setDeleting(true);
      setError('');

      await deleteCustomer(confirmDeleteId);
      await loadCustomers();
      setConfirmDeleteId(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete customer');
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError('');

      if (formMode === 'edit' && editingCustomerId) {
        await updateCustomer(editingCustomerId, formData);
      } else {
        await addCustomer(formData);
      }

      await loadCustomers();
      handleCancelForm();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(formMode === 'edit' ? 'Failed to update customer' : 'Failed to add customer');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddTraining(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const durationNumber = Number(trainingDuration);

    if (
      !trainingCustomer ||
      !trainingDate ||
      !trainingActivity.trim() ||
      Number.isNaN(durationNumber) ||
      durationNumber <= 0
    ) {
      setError('Please fill in all training fields correctly');
      return;
    }

    try {
      setTrainingSubmitting(true);
      setError('');

      await addTraining({
        date: trainingDate.toISOString(),
        activity: trainingActivity.trim(),
        duration: durationNumber,
        customer: trainingCustomer.id,
      });

      handleCancelTrainingForm();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add training');
      }
    } finally {
      setTrainingSubmitting(false);
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const searchValue = searchTerm.toLowerCase().trim();

    const fullName = `${customer.firstname} ${customer.lastname}`.toLowerCase();
    const address = customer.streetaddress.toLowerCase();
    const postcode = customer.postcode.toLowerCase();
    const city = customer.city.toLowerCase();
    const email = customer.email.toLowerCase();
    const phone = customer.phone.toLowerCase();

    return (
      fullName.includes(searchValue) ||
      address.includes(searchValue) ||
      postcode.includes(searchValue) ||
      city.includes(searchValue) ||
      email.includes(searchValue) ||
      phone.includes(searchValue)
    );
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
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
        <h2>Customers</h2>

        <div className="top-controls">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="search-input"
          />

          <button
            type="button"
            className="secondary-button"
            onClick={handleExportCsv}
          >
            Export CSV
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={formMode ? handleCancelForm : handleOpenAddForm}
          >
            {formMode ? 'Cancel' : 'Add customer'}
          </button>
        </div>
      </div>

      {formMode && (
        <form className="customer-form" onSubmit={handleSubmit}>
          <input
            name="firstname"
            placeholder="First name"
            value={formData.firstname}
            onChange={handleInputChange}
            required
          />
          <input
            name="lastname"
            placeholder="Last name"
            value={formData.lastname}
            onChange={handleInputChange}
            required
          />
          <input
            name="streetaddress"
            placeholder="Street address"
            value={formData.streetaddress}
            onChange={handleInputChange}
            required
          />
          <input
            name="postcode"
            placeholder="Postcode"
            value={formData.postcode}
            onChange={handleInputChange}
            required
          />
          <input
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleInputChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting
              ? formMode === 'edit'
                ? 'Updating...'
                : 'Saving...'
              : formMode === 'edit'
              ? 'Update customer'
              : 'Save customer'}
          </button>
        </form>
      )}

      {trainingCustomer && (
        <div className="training-box">
          <h3 className="training-box-title">
            Add training for {trainingCustomer.firstname} {trainingCustomer.lastname}
          </h3>

          <form className="training-form" onSubmit={handleAddTraining}>
            <div className="training-form-field">
              <label>Date and time</label>
              <DatePicker
                selected={trainingDate}
                onChange={(date) => setTrainingDate(date)}
                showTimeSelect
                timeIntervals={15}
                dateFormat="dd.MM.yyyy HH:mm"
                className="datepicker-input"
                required
              />
            </div>

            <div className="training-form-field">
              <label>Activity</label>
              <input
                type="text"
                value={trainingActivity}
                onChange={(event) => setTrainingActivity(event.target.value)}
                placeholder="Example: Gym training"
                required
              />
            </div>

            <div className="training-form-field">
              <label>Duration (minutes)</label>
              <input
                type="number"
                min="1"
                value={trainingDuration}
                onChange={(event) => setTrainingDuration(event.target.value)}
                placeholder="60"
                required
              />
            </div>

            <div className="training-form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={trainingSubmitting}
              >
                {trainingSubmitting ? 'Saving...' : 'Save training'}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={handleCancelTrainingForm}
                disabled={trainingSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmDeleteId && (
        <div className="confirm-box">
          <p>Delete this customer? This will also delete all associated trainings.</p>

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

      {loading && <p>Loading customers...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <p className="results-text">Customers found: {sortedCustomers.length}</p>

          <div className="table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('firstname')}>
                    First name{getSortArrow('firstname')}
                  </th>
                  <th onClick={() => handleSort('lastname')}>
                    Last name{getSortArrow('lastname')}
                  </th>
                  <th onClick={() => handleSort('streetaddress')}>
                    Street address{getSortArrow('streetaddress')}
                  </th>
                  <th onClick={() => handleSort('postcode')}>
                    Postcode{getSortArrow('postcode')}
                  </th>
                  <th onClick={() => handleSort('city')}>
                    City{getSortArrow('city')}
                  </th>
                  <th onClick={() => handleSort('email')}>
                    Email{getSortArrow('email')}
                  </th>
                  <th onClick={() => handleSort('phone')}>
                    Phone{getSortArrow('phone')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.firstname}</td>
                    <td>{customer.lastname}</td>
                    <td>{customer.streetaddress}</td>
                    <td>{customer.postcode}</td>
                    <td>{customer.city}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td className="actions-cell">
                      <button
                        type="button"
                        className="table-action-button"
                        onClick={() => handleOpenEditForm(customer)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="table-train-button"
                        onClick={() => handleOpenTrainingForm(customer)}
                      >
                        Add training
                      </button>

                      <button
                        type="button"
                        className="table-delete-button"
                        onClick={() => handleOpenDeleteConfirm(customer.id)}
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