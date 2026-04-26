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

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<void> {
  const response = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customer),
  });

  if (!response.ok) {
    throw new Error('Failed to add customer');
  }
}

export async function updateCustomer(
  customerId: string,
  customer: Omit<Customer, 'id'>
): Promise<void> {
  const response = await fetch(customerId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customer),
  });

  if (!response.ok) {
    throw new Error('Failed to update customer');
  }
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const response = await fetch(customerId, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete customer');
  }
}

export async function addTraining(training: {
  date: string;
  activity: string;
  duration: number;
  customer: string;
}): Promise<void> {
  const response = await fetch(`${BASE_URL}/trainings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(training),
  });

  if (!response.ok) {
    throw new Error('Failed to add training');
  }
}

export async function deleteTraining(trainingId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/trainings/${trainingId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete training');
  }
}