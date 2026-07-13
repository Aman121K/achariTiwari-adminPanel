export const metrics = [
  { label: 'Gross sales', value: 'Rs. 82,450', detail: '+12% vs last week' },
  { label: 'Open orders', value: '18', detail: '7 need fulfillment' },
  { label: 'Conversion', value: '3.8%', detail: 'Storefront checkout' },
  { label: 'Low stock', value: '6', detail: 'Variants below threshold' },
]

export const orders = [
  {
    id: 'AT-20260708-K91MA',
    customer: 'Riya Sharma',
    email: 'riya@example.com',
    total: 'Rs. 1,246',
    payment: 'Paid',
    fulfillment: 'Packed',
    items: 'Mango Aachar 500g x 2',
  },
  {
    id: 'AT-20260708-P4N2Q',
    customer: 'Arjun Mehta',
    email: 'arjun@example.com',
    total: 'Rs. 738',
    payment: 'Pending',
    fulfillment: 'New',
    items: 'Nimbu Mirchi 250g x 1',
  },
  {
    id: 'AT-20260707-X82LB',
    customer: 'Neha Iyer',
    email: 'neha@example.com',
    total: 'Rs. 1,596',
    payment: 'Paid',
    fulfillment: 'Shipped',
    items: 'Amla Murabba combo',
  },
]

export const products = [
  {
    title: 'Khatta Meetha Mango Aachar',
    category: 'Mango Pickles',
    status: 'Active',
    inventory: '42 in stock',
    price: 'Rs. 249 - Rs. 499',
  },
  {
    title: 'Nimbu Mirchi Aachar',
    category: 'Spicy Pickles',
    status: 'Active',
    inventory: '5 in stock',
    price: 'Rs. 199 - Rs. 399',
  },
  {
    title: 'Amla Murabba',
    category: 'Murabba',
    status: 'Draft',
    inventory: '18 in stock',
    price: 'Rs. 299',
  },
]

export const customers = [
  { name: 'Riya Sharma', email: 'riya@example.com', orders: 4, spent: 'Rs. 4,812' },
  { name: 'Arjun Mehta', email: 'arjun@example.com', orders: 2, spent: 'Rs. 1,476' },
  { name: 'Neha Iyer', email: 'neha@example.com', orders: 6, spent: 'Rs. 7,292' },
]
