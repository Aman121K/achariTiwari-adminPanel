# AachariTiwari Admin Dashboard

A comprehensive Shopify-like admin panel built with React, TypeScript, and Tailwind CSS for managing the AachariTiwari e-commerce platform.

## Features

### Dashboard
- Sales overview with charts
- Recent orders and statistics
- Top-performing products
- Revenue analytics

### Product Management
- CRUD operations for products
- Bulk import/export
- Product variants and options
- SEO optimization fields
- Image management
- Inventory tracking

### Order Management
- View all orders with filters
- Order status tracking
- Customer information
- Shipping management
- Order history and tracking

### Customer Management
- View all customers
- Customer profiles
- Order history per customer
- Wishlist management
- Customer segmentation

### Discount Management
- Create discount codes
- Set discount rules (percentage/fixed)
- Manage discount validity
- Track discount usage
- Apply to specific products/categories

### Banner Management
- Create promotional banners
- Schedule banner display
- Multiple display locations (home, category, search)
- Desktop and mobile versions

### Reports & Analytics
- Sales reports
- Product performance
- Customer insights
- Inventory reports
- Traffic analytics

### Settings
- Store settings
- User management
- Security settings
- API configuration

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Installation

1. Navigate to admin directory:
```bash
cd admin
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment:
```
VITE_API_URL=https://api-achar.phoneclubs.com/api
VITE_APP_NAME=AachariTiwari Admin
```

## Running the Admin Panel

### Development
```bash
npm run dev
```
Open http://localhost:3000

### Production Build
```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   ├── Table.tsx
│   ├── Modal.tsx
│   ├── Form.tsx
│   └── Charts.tsx
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── ProductForm.tsx
│   ├── Orders.tsx
│   ├── OrderDetail.tsx
│   ├── Users.tsx
│   ├── Discounts.tsx
│   ├── DiscountForm.tsx
│   ├── Banners.tsx
│   ├── BannerForm.tsx
│   ├── Reports.tsx
│   ├── Settings.tsx
│   └── Login.tsx
├── layouts/            # Layout components
│   └── Layout.tsx
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
├── services/           # API services
│   ├── auth.ts
│   ├── products.ts
│   ├── orders.ts
│   ├── users.ts
│   ├── discounts.ts
│   └── banners.ts
├── hooks/              # Custom hooks
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useNotification.ts
├── types/              # TypeScript types
│   └── index.ts
├── utils/              # Utility functions
│   ├── api.ts
│   ├── format.ts
│   └── validation.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Key Pages

### Dashboard
- Overview of store metrics
- Recent orders and sales
- Top products
- Traffic sources

### Products
- Product list with search and filters
- Bulk actions
- Quick edit functionality
- Image management
- Pricing and inventory

### Orders
- All orders with status indicators
- Order filtering by status, date, customer
- Order details page
- Shipping and tracking

### Customers
- Customer list with search
- Customer profiles
- Purchase history
- Customer segments

### Discounts
- Active discounts list
- Create/edit discounts
- Discount analytics
- Usage tracking

### Banners
- Promotional banners
- Schedule display
- Choose display location
- Desktop/mobile versions

### Analytics & Reports
- Sales analytics
- Product performance
- Customer analytics
- Inventory reports
- Custom date ranges

## Authentication

The admin panel uses JWT authentication. Users must log in with admin credentials.

Login flow:
1. User enters email and password
2. Backend validates and returns JWT token
3. Token is stored in localStorage
4. All subsequent requests include token in Authorization header
5. Protected routes check token validity

## API Integration

The admin panel communicates with the backend via REST API:

- Base URL: `https://api-achar.phoneclubs.com/api`
- Authentication: JWT tokens in `Authorization` header
- Format: JSON

Example API calls:
```typescript
// Get all products
GET /products

// Create product
POST /products
{
  name: string
  description: string
  price: number
  // ... other fields
}

// Get all orders
GET /admin/orders

// Update order status
PUT /admin/orders/:orderId/status
{
  status: string
}
```

## Component Library

### Sidebar
- Navigation menu
- Company branding
- User profile section
- Logout button

### Navbar
- Search functionality
- Notifications
- User menu
- Settings

### Table
- Sortable columns
- Pagination
- Row actions
- Bulk select

### Modal
- Reusable dialog component
- Form handling
- Confirmation dialogs

### Form
- Input validation
- Error handling
- Auto-save drafts
- File uploads

### Charts
- Sales graphs
- Product analytics
- Customer trends
- Revenue charts

## Development Guidelines

1. **Component Structure**: Keep components modular and reusable
2. **State Management**: Use React Context for global state
3. **Error Handling**: Implement try-catch and proper error messages
4. **Validation**: Validate input on client and server
5. **Accessibility**: Follow WCAG guidelines
6. **Performance**: Optimize renders with React.memo and useMemo
7. **Styling**: Use Tailwind utilities, keep CSS minimal

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Deployment

1. Build the project
2. Deploy `dist` folder to your hosting provider
3. Configure environment variables
4. Set up CORS on backend
5. Test all functionality

## Common Tasks

### Adding a new page
1. Create page component in `src/pages`
2. Add route in `App.tsx`
3. Add navigation link in Sidebar
4. Create API service if needed

### Adding a new feature
1. Create required components
2. Implement API integration
3. Add form validation
4. Add error handling
5. Add tests

### Customizing styling
1. Modify `tailwind.config.js` for colors/fonts
2. Update global styles in `index.css`
3. Use Tailwind classes in components

## Troubleshooting

### Port 3000 already in use
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### API connection issues
- Check backend is running on port 5000
- Verify `VITE_API_URL` in `.env`
- Check CORS settings on backend

### Build errors
- Clear `node_modules` and reinstall
- Clear Vite cache: `rm -rf dist .vite`
- Check TypeScript errors: `npx tsc --noEmit`

## Performance Optimization

- Code splitting with React.lazy
- Image optimization
- Memoization of expensive computations
- Pagination for large datasets
- Debouncing for search/filters

## Security

- JWT token validation
- Password hashing (backend)
- HTTPS enforcement (production)
- CORS configuration
- Input sanitization
- CSRF protection

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

ISC

## Support

For issues or questions:
- Email: support@acharitiwari.com
- Documentation: /docs
- Bug reports: GitHub Issues
