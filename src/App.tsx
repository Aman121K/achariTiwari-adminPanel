import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './layouts/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import Orders from './pages/Orders'
import Carts from './pages/Carts'
import OrderDetail from './pages/OrderDetail'
import Users from './pages/Users'
import Blogs from './pages/Blogs'
import Discounts from './pages/Discounts'
import DiscountForm from './pages/DiscountForm'
import Banners from './pages/Banners'
import BannerForm from './pages/BannerForm'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Reviews from './pages/Reviews'
import BlogForm from './pages/BlogForm'
import UserForm from './pages/UserForm'
import Categories from './pages/Categories'
import CategoryForm from './pages/CategoryForm'
import Subscribers from './pages/Subscribers'
import SeoManager from './pages/SeoManager'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Products */}
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/new" element={<CategoryForm />} />
            <Route path="categories/:id" element={<CategoryForm />} />
            
            {/* Orders */}
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="carts" element={<Carts />} />
            
            {/* Users */}
            <Route path="users" element={<Users />} />
            <Route path="users/new" element={<UserForm />} />
            <Route path="users/:id" element={<UserForm />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="subscribers" element={<Subscribers />} />

            {/* Blogs */}
            <Route path="blogs" element={<Blogs />} />
            <Route path="blogs/new" element={<BlogForm />} />
            <Route path="blogs/:id" element={<BlogForm />} />
            
            {/* Discounts */}
            <Route path="discounts" element={<Discounts />} />
            <Route path="discounts/new" element={<DiscountForm />} />
            <Route path="discounts/:id" element={<DiscountForm />} />
            
            {/* Banners */}
            <Route path="banners" element={<Banners />} />
            <Route path="banners/new" element={<BannerForm />} />
            <Route path="banners/:id" element={<BannerForm />} />
            
            {/* Reports */}
            <Route path="reports" element={<Reports />} />
            
            {/* Settings */}
            <Route path="seo" element={<SeoManager />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
