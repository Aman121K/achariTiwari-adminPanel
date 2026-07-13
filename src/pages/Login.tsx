import { FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { user, login, loading } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const [email,setEmail] = useState(''); const [password,setPassword] = useState(''); const [error,setError] = useState('')
  if (user) return <Navigate to="/dashboard" replace />
  const submit = async (event:FormEvent) => { event.preventDefault(); setError(''); try { await login(email,password); navigate((location.state as any)?.from || '/dashboard',{replace:true}) } catch (e) { setError(e instanceof Error ? e.message : 'Sign in failed') } }
  return <main className="grid min-h-screen place-items-center bg-slate-100 px-6"><section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-amber-600">Achari OS</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">Admin sign in</h1><p className="mt-3 text-sm text-slate-500">Sign in with an administrator account.</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="grid gap-2 text-sm font-medium">Email<input value={email} onChange={e=>setEmail(e.target.value)} required className="rounded-lg border px-3 py-2.5" type="email" autoComplete="email"/></label><label className="grid gap-2 text-sm font-medium">Password<input value={password} onChange={e=>setPassword(e.target.value)} required className="rounded-lg border px-3 py-2.5" type="password" autoComplete="current-password"/></label>{error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white">{loading?'Signing in…':'Continue'}</button></form></section></main>
}
