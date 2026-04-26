import type { Customer } from '../types/customer';
import type { Training } from '../types/training';

const BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api';

type RawCustomer = {
  firstname?: string;
  lastname?: string;
  streetaddress?: string;
  postcode?: string;
  city?: string;
  email?: string;
  phone?: string;
  _links?: {
    self?: {
      href?: string;
    };
  };
};

type CustomersResponse = {
  _embedded?: {
    customers?: RawCustomer[];
  };
};

type RawTrainingCustomer = {
  firstname?: string;
  lastname?: string;
};

type RawTraining = {
  id?: number;
  date?: string;
  duration?: number;
  activity?: string;
  customer?: RawTrainingCustomer;
};

export async function fetchCustomers(): Promise<Customer[]> {
  const response = await fetch(`${BASE_URL}/customers`);

  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }

  const data: CustomersResponse = await response.json();
  const customers = data._embedded?.customers ?? [];

  return customers.map((customer, index) => ({
    firstname: customer.firstname ?? '',
    lastname: customer.lastname ?? '',
    streetaddress: customer.streetaddress ?? '',
    postcode: customer.postcode ?? '',
    city: customer.city ?? '',
    email: customer.email ?? '',
    phone: customer.phone ?? '',
    id: customer._links?.self?.href ?? `customer-${index}`,
  }));
}

export async function fetchTrainings(): Promise<Training[]> {
  const response = await fetch(`${BASE_URL}/gettrainings`);

  if (!response.ok) {
    throw new Error('Failed to fetch trainings');
  }

  const data: RawTraining[] = await response.json();

  return data.map((training, index) => ({
    id: String(training.id ?? index),
    date: training.date ?? '',
    duration: training.duration ?? 0,
    activity: training.activity ?? '',
    customerName: `${training.customer?.firstname ?? ''} ${training.customer?.lastname ?? ''}`.trim(),
  }));
}