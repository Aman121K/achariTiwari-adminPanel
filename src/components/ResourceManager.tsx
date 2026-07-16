import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'

export type ResourceField = {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'textarea' | 'richtext' | 'select' | 'checkbox' | 'password' | 'media'
  options?: Array<string | { value: string; label: string; parentValue?: string }>
  dependsOn?: string
  mediaFolder?: string
  multiple?: boolean
  required?: boolean
  list?: boolean
  defaultValue?: string | number | boolean
  getValue?: (item: Record<string, any>) => any
  getFormValue?: (item: Record<string, any>) => any
}

export type ResourceConfig = {
  title: string
  singular: string
  description: string
  endpoint: string
  responseKey: string
  itemKey: string
  fields: ResourceField[]
  readOnlyCreate?: boolean
  preparePayload?: (form: Record<string, any>, existing: Record<string, any> | null) => Record<string, any>
}

type Props = ResourceConfig & { basePath: string }

function ListingSkeleton({ columns }: { columns: number }) {
  return <div role="status" aria-live="polite" className="animate-pulse" aria-label="Loading records">
    <span className="sr-only">Loading records…</span>
    <div className="hidden md:block">
      <div className="grid gap-5 border-b border-slate-100 bg-[#fbf8f2] px-5 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr)) 96px` }}>
        {Array.from({ length: columns + 1 }).map((_, index) => <span key={index} className="h-2.5 rounded bg-slate-200" />)}
      </div>
      {Array.from({ length: 6 }).map((_, row) => <div key={row} className="grid gap-5 border-b border-slate-100 px-5 py-5 last:border-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr)) 96px` }}>
        {Array.from({ length: columns }).map((_, col) => <span key={col} className={`h-3 rounded bg-slate-100 ${col === 0 ? 'w-4/5' : 'w-3/5'}`} />)}
        <span className="ml-auto h-8 w-20 rounded-lg bg-slate-100" />
      </div>)}
    </div>
    <div className="grid gap-3 p-3 md:hidden">
      {Array.from({ length: 4 }).map((_, row) => <div key={row} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between"><span className="h-4 w-2/5 rounded bg-slate-200"/><span className="h-7 w-16 rounded-lg bg-amber-100"/></div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">{Array.from({ length: 4 }).map((_, col) => <div key={col}><span className="mb-2 block h-2 w-12 rounded bg-slate-100"/><span className="block h-3 w-4/5 rounded bg-slate-200"/></div>)}</div>
      </div>)}
    </div>
  </div>
}

export default function ResourceManager({ title, description, endpoint, responseKey, itemKey, fields, readOnlyCreate, basePath }: Props) {
  const navigate = useNavigate()
  const [items, setItems] = useState<Record<string, any>[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try { const data = await apiRequest(endpoint); setItems(data[responseKey] || []) }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load records') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [endpoint])
  const visible = useMemo(() => items.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [items, query])
  const remove = async (item: Record<string, any>) => {
    if (!window.confirm(`Delete ${item[itemKey] || 'this record'}? This cannot be undone.`)) return
    try { await apiRequest(`${endpoint.replace(/\?.*$/, '')}/${item._id}`, { method: 'DELETE' }); await load() }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to delete record') }
  }
  const listFields = fields.filter((field) => field.list !== false).slice(0, 5)

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-wider text-amber-600">Live data</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div>
      {!readOnlyCreate && <button onClick={() => navigate(`${basePath}/new`)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16}/> Add new</button>}
    </header>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-[#fffdf9] p-4 sm:flex-row"><label className="flex min-h-[44px] flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100"><Search size={17} className="text-slate-400"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${title.toLowerCase()}`} className="min-w-0 w-full py-2.5 text-base outline-none sm:text-sm"/></label><button onClick={load} disabled={loading} aria-label={loading ? 'Refreshing records' : 'Refresh records'} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 disabled:cursor-wait disabled:opacity-60"><RefreshCw size={17} className={loading ? 'animate-spin' : ''}/><span className="sm:sr-only">{loading ? 'Refreshing…' : 'Refresh'}</span></button></div>
      <div aria-busy={loading}>
      {loading ? <ListingSkeleton columns={listFields.length}/> : error ? <div role="alert" className="m-4 flex flex-col items-center border border-red-200 bg-red-50 px-5 py-10 text-center"><AlertCircle className="mb-3 text-red-600"/><strong className="text-slate-900">We couldn't load these records</strong><p className="mt-1 max-w-md text-sm text-red-700">{error}</p><button onClick={load} className="mt-5 min-h-[44px] rounded-lg border border-red-300 bg-white px-4 text-sm font-semibold text-red-700">Try again</button></div> : visible.length === 0 ? <div className="px-5 py-14 text-center"><Search className="mx-auto mb-3 text-amber-500"/><strong className="text-slate-900">{query ? 'No matching records' : `No ${title.toLowerCase()} yet`}</strong><p className="mt-1 text-sm text-slate-500">{query ? 'Try a different search term.' : 'New records will appear here when they are added.'}</p>{query && <button onClick={()=>setQuery('')} className="mt-4 min-h-[44px] text-sm font-semibold text-amber-700">Clear search</button>}</div> : <>
        <div className="hidden md:block"><table className="w-full text-left text-sm"><thead className="bg-[#fbf8f2] text-xs uppercase tracking-wide text-slate-500"><tr>{listFields.map((field) => <th key={field.key} className="px-4 py-3">{field.label}</th>)}<th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((item) => <tr key={item._id} className="transition hover:bg-amber-50/50">{listFields.map((field) => { const value = field.getValue ? field.getValue(item) : item[field.key]; return <td key={field.key} className="max-w-[260px] truncate px-4 py-4 text-slate-700">{typeof value === 'boolean' ? <span className={`rounded-md px-2 py-1 text-xs font-semibold ${value?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{value?'Active':'Inactive'}</span> : String(value ?? '—')}</td>})}<td className="px-4 py-4"><div className="flex justify-end gap-2"><button onClick={() => navigate(`${basePath}/${item._id}`)} aria-label={readOnlyCreate ? 'View record' : 'Edit record'} className="grid h-10 w-10 place-items-center rounded-lg border text-slate-600 hover:bg-slate-100">{readOnlyCreate ? <Eye size={16}/> : <Pencil size={16}/>}</button><button onClick={() => remove(item)} aria-label="Delete record" className="grid h-10 w-10 place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>
        <div className="grid gap-3 bg-[#f8f4ed] p-3 md:hidden">{visible.map(item=><article key={item._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><dl className="grid grid-cols-2 gap-x-5 gap-y-4">{listFields.map((field,index)=>{const value=field.getValue?field.getValue(item):item[field.key];return <div key={field.key} className={index===0?'col-span-2 border-b border-slate-100 pb-3':''}><dt className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{field.label}</dt><dd className={`${index===0?'font-semibold text-slate-950':'text-sm text-slate-700'} break-words`}>{typeof value==='boolean'?<span className={`rounded-md px-2 py-1 text-xs font-semibold ${value?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{value?'Active':'Inactive'}</span>:String(value??'—')}</dd></div>})}</dl><div className="mt-4 flex gap-2 border-t border-slate-100 pt-3"><button onClick={()=>navigate(`${basePath}/${item._id}`)} className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border font-semibold text-slate-700">{readOnlyCreate?<Eye size={16}/>:<Pencil size={16}/>} {readOnlyCreate?'View':'Edit'}</button><button onClick={()=>remove(item)} aria-label="Delete record" className="grid min-h-[44px] min-w-[48px] place-items-center rounded-lg border border-red-200 text-red-600"><Trash2 size={16}/></button></div></article>)}</div>
      </>}
      </div>
    </section>
  </div>
}
