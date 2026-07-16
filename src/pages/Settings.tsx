import { FormEvent, useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'

const fields = [
  ['storeName', 'Store name'],
  ['supportEmail', 'Support email'],
  ['supportPhone', 'Support phone'],
  ['announcement', 'Announcement bar'],
  ['heroTitle', 'Homepage hero title'],
  ['heroDescription', 'Homepage hero description'],
  ['seoTitle', 'Default SEO title'],
  ['seoDescription', 'Default SEO description'],
  ['termsContent', 'Terms & conditions'],
  ['privacyContent', 'Privacy policy'],
  ['refundContent', 'Refund & return policy'],
  ['shippingContent', 'Shipping policy'],
] as const

type SettingsForm = Record<string, unknown> & {
  acceptedPayments: string[]
  freeShippingThreshold: number
}

export default function Settings() {
  const [form, setForm] = useState<SettingsForm>({ acceptedPayments: ['cod', 'upi'], freeShippingThreshold: 699 })
  const [message, setMessage] = useState('')

  useEffect(() => {
    apiRequest('/store/settings')
      .then((data) => setForm(data.settings))
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Unable to load settings'))
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('Saving…')
    try {
      const data = await apiRequest('/store/settings', { method: 'PUT', body: JSON.stringify(form) })
      setForm(data.settings)
      setMessage('Store settings saved and immediately available to the storefront.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <header className="rounded-xl border bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Live storefront configuration</p>
        <h1 className="mt-2 text-3xl font-semibold">Store, SEO & policies</h1>
        <p className="mt-2 text-sm text-slate-500">These values power the homepage, service pages, checkout rules and default search metadata.</p>
      </header>
      <section className="grid gap-5 rounded-xl border bg-white p-6 md:grid-cols-2">
        {fields.map(([key, label]) => (
          <label key={key} className={`grid gap-2 text-sm font-medium ${key.endsWith('Content') || key.endsWith('Description') ? 'md:col-span-2' : ''}`}>
            {label}
            {key.endsWith('Content') || key.endsWith('Description') ? (
              <textarea rows={key.endsWith('Content') ? 7 : 3} value={String(form[key] || '')} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="rounded-lg border px-3 py-2" />
            ) : (
              <input value={String(form[key] || '')} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="rounded-lg border px-3 py-2.5" />
            )}
          </label>
        ))}
        <label className="grid gap-2 text-sm font-medium">
          Free shipping threshold
          <input type="number" value={form.freeShippingThreshold || 0} onChange={(event) => setForm({ ...form, freeShippingThreshold: Number(event.target.value) })} className="rounded-lg border px-3 py-2.5" />
        </label>
        <fieldset>
          <legend className="text-sm font-medium">Accepted payments</legend>
          <div className="mt-3 flex gap-5">
            {['cod', 'upi'].map((method) => (
              <label key={method} className="flex gap-2 text-sm">
                <input type="checkbox" checked={(form.acceptedPayments || []).includes(method)} onChange={(event) => setForm({ ...form, acceptedPayments: event.target.checked ? [...(form.acceptedPayments || []), method] : (form.acceptedPayments || []).filter((item) => item !== method) })} />
                {method === 'cod' ? 'Cash on delivery' : 'UPI'}
              </label>
            ))}
          </div>
        </fieldset>
      </section>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">{message}</p>
        <button className="min-h-[44px] shrink-0 rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white">Save settings</button>
      </div>
    </form>
  )
}
