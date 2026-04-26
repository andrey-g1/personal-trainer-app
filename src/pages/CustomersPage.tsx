import { useEffect, useState } from 'react';
import { fetchCustomers } from '../services/api';
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('firstname');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
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

        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="search-input"
        />
      </div>

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