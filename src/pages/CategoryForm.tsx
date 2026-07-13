import { useEffect, useMemo, useState } from 'react'
import ResourceForm from '../components/ResourceForm'
import { categoryConfig } from '../data/resourceConfigs'
import { apiRequest } from '../lib/api'

export default function CategoryForm(){
  const [categories,setCategories]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  useEffect(()=>{apiRequest('/admin/categories').then(data=>setCategories(data.categories||[])).catch(error=>setError(error instanceof Error?error.message:'Unable to load categories')).finally(()=>setLoading(false))},[])
  const config=useMemo(()=>categoryConfig(categories),[categories])
  if(loading)return <div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">Loading categories…</div>
  if(error)return <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
  return <ResourceForm config={config} basePath="/categories"/>
}
