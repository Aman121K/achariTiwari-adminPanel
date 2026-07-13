import { useEffect, useMemo, useState } from 'react'
import ResourceManager from '../components/ResourceManager'
import { categoryConfig } from '../data/resourceConfigs'
import { apiRequest } from '../lib/api'

export default function Categories(){
  const [categories,setCategories]=useState<any[]>([])
  useEffect(()=>{apiRequest('/admin/categories').then(data=>setCategories(data.categories||[])).catch(()=>undefined)},[])
  const config=useMemo(()=>categoryConfig(categories),[categories])
  return <ResourceManager {...config} basePath="/categories"/>
}
