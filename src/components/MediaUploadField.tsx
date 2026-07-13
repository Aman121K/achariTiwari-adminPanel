import { useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { apiRequest } from '../lib/api'

export default function MediaUploadField({ value, onChange, folder='general', multiple=false }: { value:string; onChange:(value:string)=>void; folder?:string; multiple?:boolean }) {
  const [uploading,setUploading]=useState(false); const [error,setError]=useState('')
  const upload=async(file?:File)=>{if(!file)return;setUploading(true);setError('');try{const body=new FormData();body.append('file',file);body.append('folder',folder);const data=await apiRequest('/admin/media',{method:'POST',body});onChange(multiple&&value?`${value}, ${data.asset.url}`:data.asset.url)}catch(requestError){setError(requestError instanceof Error?requestError.message:'Upload failed')}finally{setUploading(false)}}
  const preview=String(value||'').split(',')[0].trim()
  return <div className="space-y-2"><div className="flex gap-2"><input value={value||''} onChange={event=>onChange(event.target.value)} placeholder="S3 image URL appears here" className="min-w-0 flex-1 rounded-lg border px-3 py-2.5"/><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-slate-50 px-4 py-2.5 font-semibold hover:bg-slate-100">{uploading?<Loader2 className="animate-spin" size={17}/>:<ImagePlus size={17}/>} Upload<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf" disabled={uploading} onChange={event=>void upload(event.target.files?.[0])} className="sr-only"/></label></div>{preview&&/\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(preview)&&<img src={preview} alt="Uploaded preview" className="h-28 w-28 rounded-lg border object-cover"/>}{multiple&&<p className="text-xs font-normal text-slate-500">Upload repeatedly to add more images. The first image is the storefront cover.</p>}{error&&<p className="text-xs font-normal text-red-600">{error}</p>}</div>
}
