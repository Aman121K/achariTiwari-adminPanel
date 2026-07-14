import { Outlet, Link, NavLink } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  Boxes,
  ClipboardList,
  Image,
  LayoutDashboard,
  Settings,
  Tags,
  FolderTree,
  Users,
  Star,
  ShoppingBasket,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/carts', label: 'Abandoned carts', icon: ShoppingBasket },
  { to: '/users', label: 'Customers', icon: Users },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/blogs', label: 'Blogs / SEO', icon: BookOpen },
  { to: '/discounts', label: 'Discounts', icon: Tags },
  { to: '/banners', label: 'Banners', icon: Image },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const Layout = () => {
  const { user, logout } = useAuth()
  return (
  <div className="grid min-h-screen bg-slate-100 text-slate-900 lg:grid-cols-[280px_1fr]">
    <aside className="border-r border-slate-800 bg-slate-950 px-5 py-6 text-white">
      <Link to="/dashboard" className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500 font-black text-slate-950">AT</span>
        <span>
          <span className="block text-lg font-semibold">Achari OS</span>
          <span className="block text-xs text-slate-400">Commerce admin</span>
        </span>
      </Link>
      <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Live store</p>
        <strong className="mt-2 block">Achari Tiwari</strong>
        <p className="mt-2 text-sm leading-6 text-slate-400">Products, orders, campaigns and fulfillment are managed here.</p>
      </div>
      <nav className="mt-6 grid gap-1">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`
            }
            key={item.to}
            to={item.to}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>

    <div className="min-w-0">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Admin workspace</p>
            <h2 className="text-lg font-semibold text-slate-950">Store command center</h2>
          </div>
          <button onClick={logout} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Sign out · {user?.name}</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  </div>
  )
}

export default Layout
