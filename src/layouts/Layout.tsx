import { useEffect, useState } from 'react'
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
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
  Menu,
  X,
  Mail,
  SearchCheck,
  LogOut,
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
  { to: '/subscribers', label: 'Subscribers', icon: Mail },
  { to: '/blogs', label: 'Blogs', icon: BookOpen },
  { to: '/discounts', label: 'Discounts', icon: Tags },
  { to: '/banners', label: 'Banners', icon: Image },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/seo', label: 'SEO Manager', icon: SearchCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const Layout = () => {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setMenuOpen(false), [location.pathname])
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false)
    document.body.style.overflow = 'hidden'; window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [menuOpen])
  const navigation = <>
    <Link to="/dashboard" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500 font-black text-slate-950">AT</span><span><span className="block text-lg font-semibold">Achari OS</span><span className="block text-xs text-slate-400">Commerce admin</span></span></Link>
    <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-wider text-amber-300">Live store</p><strong className="mt-2 block">Achari Tiwari</strong><p className="mt-2 text-sm leading-6 text-slate-400">Products, orders, campaigns and fulfillment are managed here.</p></div>
    <nav className="mt-6 grid gap-1">{navItems.map((item) => <NavLink className={({ isActive }) => `flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`} key={item.to} to={item.to}><item.icon size={18}/>{item.label}</NavLink>)}</nav>
  </>
  return (
  <div className="grid min-h-screen bg-slate-100 text-slate-900 lg:grid-cols-[280px_1fr]">
    <aside className="hidden border-r border-slate-800 bg-slate-950 px-5 py-6 text-white lg:block">{navigation}</aside>
    {menuOpen && <div className="fixed inset-0 z-40 lg:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-slate-950/60" onClick={()=>setMenuOpen(false)}/><aside role="dialog" aria-modal="true" aria-label="Admin navigation" className="relative h-full w-[min(86vw,320px)] overflow-y-auto bg-slate-950 px-5 py-5 text-white shadow-2xl"><button onClick={()=>setMenuOpen(false)} aria-label="Close menu" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-lg text-slate-300 hover:bg-white/10"><X/></button>{navigation}</aside></div>}

    <div className="min-w-0">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <button onClick={()=>setMenuOpen(true)} aria-label="Open navigation" aria-expanded={menuOpen} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-800 lg:hidden"><Menu size={21}/></button>
          <div className="min-w-0 flex-1">
            <p className="hidden text-xs font-bold uppercase tracking-wider text-slate-500 sm:block">Admin workspace</p>
            <h2 className="truncate text-base font-semibold text-slate-950 sm:text-lg">Store command center</h2>
          </div>
          <button onClick={logout} aria-label={`Sign out${user?.name ? ` ${user.name}` : ''}`} title="Sign out" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 sm:flex sm:w-auto sm:max-w-[220px] sm:grid-cols-none sm:gap-2 sm:px-4"><LogOut size={18} className="shrink-0"/><span className="hidden truncate sm:inline">{user?.name || 'Sign out'}</span></button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  </div>
  )
}

export default Layout
