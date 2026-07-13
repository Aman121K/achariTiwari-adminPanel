import type React from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgePercent,
  Box,
  CheckCircle2,
  Globe2,
  ImagePlus,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  Truck,
} from 'lucide-react'
import { customers, metrics, orders, products } from '../data/mockCommerce'

type CommercePageProps = {
  title: string
  eyebrow: string
  description: string
  primaryAction?: string
  secondaryAction?: string
  mode?: 'dashboard' | 'orders' | 'products' | 'customers' | 'form' | 'settings' | 'reports' | 'blogs'
}

const statusClass = (value: string) => {
  const status = value.toLowerCase()
  if (['paid', 'active', 'shipped'].includes(status)) return 'bg-emerald-100 text-emerald-700'
  if (['pending', 'packed', 'new', 'draft'].includes(status)) return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-700'
}

const MetricGrid = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {metrics.map((metric) => (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={metric.label}>
        <p className="text-sm font-medium text-slate-500">{metric.label}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</h2>
        <p className="mt-2 text-sm text-slate-500">{metric.detail}</p>
      </section>
    ))}
  </div>
)

const OrderTable = () => (
  <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Order queue</h2>
        <p className="text-sm text-slate-500">Review payment, packing and delivery status from one workspace.</p>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500">
        <Search size={16} />
        Search orders
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Payment</th>
            <th className="px-4 py-3">Fulfillment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => (
            <tr className="hover:bg-slate-50" key={order.id}>
              <td className="px-4 py-4 font-semibold text-slate-950">{order.id}</td>
              <td className="px-4 py-4">
                <span className="block font-medium text-slate-900">{order.customer}</span>
                <span className="text-slate-500">{order.email}</span>
              </td>
              <td className="px-4 py-4 text-slate-600">{order.items}</td>
              <td className="px-4 py-4 font-semibold text-slate-950">{order.total}</td>
              <td className="px-4 py-4">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(order.payment)}`}>{order.payment}</span>
              </td>
              <td className="px-4 py-4">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(order.fulfillment)}`}>{order.fulfillment}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

const ProductTable = () => (
  <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-200 p-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Catalog</h2>
        <p className="text-sm text-slate-500">Manage listings, variants, inventory and visibility.</p>
      </div>
      <Link className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white" to="/products/new">
        Add product
      </Link>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Inventory</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr className="hover:bg-slate-50" key={product.title}>
              <td className="px-4 py-4 font-semibold text-slate-950">{product.title}</td>
              <td className="px-4 py-4 text-slate-600">{product.category}</td>
              <td className="px-4 py-4 text-slate-600">{product.price}</td>
              <td className="px-4 py-4 text-slate-600">{product.inventory}</td>
              <td className="px-4 py-4">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(product.status)}`}>{product.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

const CustomerTable = () => (
  <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 p-4">
      <h2 className="text-lg font-semibold text-slate-950">Customers</h2>
      <p className="text-sm text-slate-500">Customer history, order count and lifetime spend.</p>
    </div>
    <div className="divide-y divide-slate-100">
      {customers.map((customer) => (
        <div className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]" key={customer.email}>
          <div>
            <strong className="block text-slate-950">{customer.name}</strong>
            <span className="text-sm text-slate-500">{customer.email}</span>
          </div>
          <span className="text-sm text-slate-600">{customer.orders} orders</span>
          <span className="font-semibold text-slate-950">{customer.spent}</span>
        </div>
      ))}
    </div>
  </section>
)

const BlogTable = () => (
  <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Content pipeline</h2>
        <p className="text-sm text-slate-500">SEO posts for recipes, ingredients, brand stories and regional pickle guides.</p>
      </div>
      <Link className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white" to="/blogs/new">
        Add blog post
      </Link>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Post</th>
            <th className="px-4 py-3">Focus keyword</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Intent</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {[
            ['How to Choose Mango Aachar for Indian Meals', 'mango aachar', 'Recipes', 'Published', 'Buyer education'],
            ['Why Mustard Oil Matters in Traditional Pickles', 'mustard oil pickle', 'Ingredients', 'Published', 'Ingredient trust'],
            ['Bihar-Style Aachar Traditions for Modern Homes', 'Bihar pickle', 'Brand stories', 'Draft', 'Brand authority'],
          ].map((post) => (
            <tr className="hover:bg-slate-50" key={post[0]}>
              <td className="px-4 py-4 font-semibold text-slate-950">{post[0]}</td>
              <td className="px-4 py-4 text-slate-600">{post[1]}</td>
              <td className="px-4 py-4 text-slate-600">{post[2]}</td>
              <td className="px-4 py-4">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(post[3])}`}>{post[3]}</span>
              </td>
              <td className="px-4 py-4 text-slate-600">{post[4]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

const WorkflowCards = () => (
  <div className="grid gap-4 lg:grid-cols-3">
    {[
      { icon: PackageCheck, title: 'Pick and pack', text: 'Move new orders into packed status after inventory check.' },
      { icon: Truck, title: 'Ship with tracking', text: 'Add courier partner and AWB before marking shipped.' },
      { icon: ShieldCheck, title: 'Close the loop', text: 'Mark delivered, then trigger review and reorder emails.' },
    ].map((card) => (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={card.title}>
        <card.icon className="text-slate-700" size={22} />
        <h3 className="mt-4 font-semibold text-slate-950">{card.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{card.text}</p>
      </section>
    ))}
  </div>
)

const Field = ({
  label,
  children,
  helper,
}: {
  label: string
  children: React.ReactNode
  helper?: string
}) => (
  <label className="grid gap-2 text-sm font-medium text-slate-700">
    {label}
    {children}
    {helper ? <span className="text-xs font-normal leading-5 text-slate-500">{helper}</span> : null}
  </label>
)

const inputClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100'

const SectionCard = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) => (
  <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex gap-3 border-b border-slate-200 p-5">
      <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-slate-100 text-slate-700">
        <Icon size={18} />
      </span>
      <div>
        <h2 className="font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </section>
)

const splitValues = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const ProductEditor = () => {
  const [title, setTitle] = useState('Khatta Meetha Mango Aachar')
  const [description, setDescription] = useState(
    'Small-batch mango aachar made with mustard oil, jaggery, fennel and red chilli. Packed fresh for everyday Indian meals.'
  )
  const [optionOneName, setOptionOneName] = useState('Size')
  const [optionOneValues, setOptionOneValues] = useState('250g, 500g, 1kg')
  const [optionTwoName, setOptionTwoName] = useState('Pack type')
  const [optionTwoValues, setOptionTwoValues] = useState('Jar, Combo pack')
  const [saveMessage, setSaveMessage] = useState('')

  const generatedVariants = useMemo(() => {
    const firstValues = splitValues(optionOneValues)
    const secondValues = splitValues(optionTwoValues)
    const baseSku = title
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 18)

    const combinations = secondValues.length
      ? firstValues.flatMap((first) => secondValues.map((second) => [first, second]))
      : firstValues.map((first) => [first])

    return combinations.map((values, index) => ({
      label: values.join(' / '),
      sku: `AT-${baseSku || 'PRODUCT'}-${index + 1}`,
      price: values[0]?.includes('1kg') ? 849 : values[0]?.includes('500g') ? 449 : 249,
      compareAtPrice: values[0]?.includes('1kg') ? 999 : values[0]?.includes('500g') ? 549 : 299,
      inventory: index === 0 ? 42 : index === 1 ? 24 : 8,
      weightKg: values[0]?.includes('1kg') ? 1.25 : values[0]?.includes('500g') ? 0.65 : 0.35,
      optionValues: values,
    }))
  }, [optionOneValues, optionTwoValues, title])

  const productPayload = {
    title,
    slug: title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, ''),
    shortDescription: 'Sun-cured sweet and tangy mango pickle.',
    description,
    ingredients: splitValues('Raw mango, mustard oil, fennel, chilli, jaggery'),
    images: splitValues('/images/mango-aachar.png, /images/achari-hero.png'),
    productType: 'Pickle',
    vendor: 'Achari Tiwari',
    collections: splitValues('Summer Specials, Best Sellers'),
    options: [
      { name: optionOneName, values: splitValues(optionOneValues) },
      { name: optionTwoName, values: splitValues(optionTwoValues) },
    ].filter((option) => option.name && option.values.length),
    variants: generatedVariants.map((variant) => ({
      label: variant.label,
      size: variant.optionValues[0] || 'Default',
      optionValues: variant.optionValues,
      sku: variant.sku,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      inventory: variant.inventory,
      lowStockThreshold: 5,
      weightKg: variant.weightKg,
      isActive: true,
    })),
    tags: splitValues('mango, sweet, spicy, mustard-oil, bestseller'),
    salesChannels: ['online_store', 'whatsapp_orders', 'cod_checkout'],
    marketing: {
      badge: 'Best seller',
      campaign: 'Summer Pickle Drop',
      upsellProductSlugs: ['nimbu-mirchi-aachar', 'amla-murabba'],
      crossSellProductSlugs: [],
    },
    shipping: {
      isPhysicalProduct: true,
      weightKg: 0.35,
      hsnCode: '20019000',
      shelfLife: '9 months',
    },
    seoTitle: 'Homemade Mango Aachar - Achari Tiwari',
    seoDescription: 'Shop small-batch mango aachar made with traditional Indian spices, mustard oil and slow curing.',
    seoKeywords: splitValues('mango achar, homemade pickle, Indian pickle'),
    searchEngine: {
      title: 'Homemade Mango Aachar - Achari Tiwari',
      description: 'Shop small-batch mango aachar made with traditional Indian spices, mustard oil and slow curing.',
      keywords: splitValues('mango achar, homemade pickle, Indian pickle'),
    },
    status: 'active',
    featured: true,
  }

  const handleSave = async () => {
    const token = window.localStorage.getItem('adminToken') || window.localStorage.getItem('token')
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

    if (!token) {
      setSaveMessage('Product payload is ready. Add an admin token to localStorage to submit it to the backend.')
      console.log('Product payload', productPayload)
      return
    }

    try {
      const response = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productPayload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.message || body.error || 'Could not save product')
      }

      setSaveMessage('Product saved to the backend.')
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Could not save product')
    }
  }

  return (
  <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
    <div className="space-y-6">
      <SectionCard icon={Box} title="Product details" description="Core customer-facing product content for storefront pages and cards.">
        <div className="grid gap-4">
          <Field label="Product title">
            <input className={inputClass} onChange={(event) => setTitle(event.target.value)} value={title} />
          </Field>
          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-40`}
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Short description">
              <input className={inputClass} defaultValue="Sun-cured sweet and tangy mango pickle." />
            </Field>
            <Field label="Ingredients">
              <input className={inputClass} defaultValue="Raw mango, mustard oil, fennel, chilli, jaggery" />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={ImagePlus} title="Media" description="Upload product images and set the order shown on storefront and checkout.">
        <div className="grid gap-4 md:grid-cols-[180px_1fr]">
          <div className="grid aspect-square place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500">
            <div>
              <ImagePlus className="mx-auto mb-2" size={26} />
              Add media
            </div>
          </div>
          <div className="grid gap-3">
            <Field label="Image URLs">
              <textarea className={`${inputClass} min-h-24`} defaultValue="/images/mango-aachar.png, /images/achari-hero.png" />
            </Field>
            <div className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Media checklist</span>
              <span>Use square primary image, lifestyle image and close-up jar image.</span>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={BadgePercent} title="Pricing" description="Set selling price, MRP, margin and tax behavior for each product.">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Price">
            <input className={inputClass} defaultValue="249" type="number" />
          </Field>
          <Field label="Compare-at price">
            <input className={inputClass} defaultValue="299" type="number" />
          </Field>
          <Field label="Cost per item">
            <input className={inputClass} defaultValue="118" type="number" />
          </Field>
          <Field label="GST rate">
            <select className={inputClass} defaultValue="5">
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
            </select>
          </Field>
        </div>
      </SectionCard>

      <SectionCard icon={PackageCheck} title="Inventory" description="Track SKU, barcode, stock policy and fulfillment readiness.">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="SKU">
            <input className={inputClass} defaultValue="AT-MANGO-250" />
          </Field>
          <Field label="Barcode">
            <input className={inputClass} placeholder="EAN / UPC" />
          </Field>
          <Field label="Available quantity">
            <input className={inputClass} defaultValue="42" type="number" />
          </Field>
          <Field label="Low-stock alert">
            <input className={inputClass} defaultValue="5" type="number" />
          </Field>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 md:col-span-2">
            <input defaultChecked type="checkbox" />
            Track quantity for this product
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 md:col-span-2">
            <input type="checkbox" />
            Continue selling when out of stock
          </label>
        </div>
      </SectionCard>

      <SectionCard icon={Sparkles} title="Options and variants" description="Create Shopify-style option sets and manage each generated variant row.">
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Option 1 name">
              <input className={inputClass} onChange={(event) => setOptionOneName(event.target.value)} value={optionOneName} />
            </Field>
            <Field label="Option 1 values" helper="Separate values with commas.">
              <input className={inputClass} onChange={(event) => setOptionOneValues(event.target.value)} value={optionOneValues} />
            </Field>
            <Field label="Option 2 name">
              <input className={inputClass} onChange={(event) => setOptionTwoName(event.target.value)} value={optionTwoName} />
            </Field>
            <Field label="Option 2 values" helper="Leave blank if the product has one option only.">
              <input className={inputClass} onChange={(event) => setOptionTwoValues(event.target.value)} value={optionTwoValues} />
            </Field>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">Variant</th>
                  <th className="px-3 py-3">SKU</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">MRP</th>
                  <th className="px-3 py-3">Stock</th>
                  <th className="px-3 py-3">Weight</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {generatedVariants.map((variant) => (
                  <tr key={variant.sku}>
                    <td className="px-3 py-3 font-semibold text-slate-900">{variant.label}</td>
                    <td className="px-3 py-3"><input className={`${inputClass} w-44`} defaultValue={variant.sku} /></td>
                    <td className="px-3 py-3"><input className={`${inputClass} w-24`} defaultValue={variant.price} type="number" /></td>
                    <td className="px-3 py-3"><input className={`${inputClass} w-24`} defaultValue={variant.compareAtPrice} type="number" /></td>
                    <td className="px-3 py-3"><input className={`${inputClass} w-20`} defaultValue={variant.inventory} type="number" /></td>
                    <td className="px-3 py-3"><input className={`${inputClass} w-20`} defaultValue={variant.weightKg} type="number" /></td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Globe2} title="Search engine listing" description="Control how this product appears in Google and shared links.">
        <div className="grid gap-4">
          <Field label="SEO title">
            <input className={inputClass} defaultValue="Homemade Mango Aachar - Achari Tiwari" />
          </Field>
          <Field label="Meta description">
            <textarea className={`${inputClass} min-h-24`} defaultValue="Shop small-batch mango aachar made with traditional Indian spices, mustard oil and slow curing." />
          </Field>
          <Field label="URL handle">
            <input className={inputClass} readOnly value={productPayload.slug} />
          </Field>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-blue-700">acharitiwari.com/products/{productPayload.slug}</p>
            <h3 className="mt-1 text-lg text-slate-950">{productPayload.seoTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">Shop small-batch mango aachar made with traditional Indian spices, mustard oil and slow curing.</p>
          </div>
        </div>
      </SectionCard>
    </div>

    <aside className="space-y-6">
      <SectionCard icon={CheckCircle2} title="Publishing" description="Control visibility and sales channel availability.">
        <div className="grid gap-4">
          {saveMessage ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              {saveMessage}
            </div>
          ) : null}
          <Field label="Status">
            <select className={inputClass} defaultValue="active">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Sales channels">
            <div className="grid gap-2 rounded-lg border border-slate-200 p-3">
              {['Online store', 'Instagram shop', 'WhatsApp orders', 'COD checkout'].map((channel) => (
                <label className="flex items-center gap-2 text-sm text-slate-700" key={channel}>
                  <input defaultChecked={channel !== 'Instagram shop'} type="checkbox" />
                  {channel}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Publish date">
            <input className={inputClass} type="date" />
          </Field>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
            onClick={handleSave}
            type="button"
          >
            Save product payload <ArrowRight size={16} />
          </button>
        </div>
      </SectionCard>

      <SectionCard icon={Tags} title="Product organization" description="Keep catalog, discovery and filters structured.">
        <div className="grid gap-4">
          <Field label="Product type">
            <input className={inputClass} defaultValue="Pickle" />
          </Field>
          <Field label="Vendor">
            <input className={inputClass} defaultValue="Achari Tiwari" />
          </Field>
          <Field label="Category">
            <select className={inputClass} defaultValue="mango-pickles">
              <option value="mango-pickles">Mango Pickles</option>
              <option value="spicy-pickles">Spicy Pickles</option>
              <option value="murabba">Murabba</option>
            </select>
          </Field>
          <Field label="Collections">
            <input className={inputClass} defaultValue="Summer Specials, Best Sellers" />
          </Field>
          <Field label="Tags">
            <input className={inputClass} defaultValue="mango, sweet, spicy, mustard-oil, bestseller" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard icon={Truck} title="Shipping" description="Product-level shipping and physical package settings.">
        <div className="grid gap-4">
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
            <input defaultChecked type="checkbox" />
            This is a physical product
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weight kg">
              <input className={inputClass} defaultValue="0.35" type="number" />
            </Field>
            <Field label="HSN code">
              <input className={inputClass} defaultValue="20019000" />
            </Field>
          </div>
          <Field label="Shelf life">
            <input className={inputClass} defaultValue="9 months" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard icon={BadgePercent} title="Marketing" description="Campaign metadata used for badges and promotions.">
        <div className="grid gap-4">
          <Field label="Product badge">
            <input className={inputClass} defaultValue="Best seller" />
          </Field>
          <Field label="Campaign">
            <input className={inputClass} defaultValue="Summer Pickle Drop" />
          </Field>
          <Field label="Upsell products">
            <input className={inputClass} defaultValue="Nimbu Mirchi Aachar, Amla Murabba" />
          </Field>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
            <input defaultChecked type="checkbox" />
            Featured on homepage
          </label>
        </div>
      </SectionCard>
    </aside>
  </section>
  )
}

const CommercePage = ({
  title,
  eyebrow,
  description,
  primaryAction = 'Create',
  secondaryAction = 'Export',
  mode = 'dashboard',
}: CommercePageProps) => (
  <div className="space-y-6">
    <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">{secondaryAction}</button>
        <button className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          {primaryAction} <ArrowRight size={16} />
        </button>
      </div>
    </section>

    {mode === 'dashboard' ? <MetricGrid /> : null}
    {mode === 'dashboard' || mode === 'orders' ? <OrderTable /> : null}
    {mode === 'dashboard' || mode === 'products' ? <ProductTable /> : null}
    {mode === 'dashboard' || mode === 'orders' ? <WorkflowCards /> : null}
    {mode === 'customers' ? <CustomerTable /> : null}
    {mode === 'blogs' ? <BlogTable /> : null}
    {mode === 'blogs' ? <WorkflowCards /> : null}
    {mode === 'form' ? <ProductEditor /> : null}
    {mode === 'reports' ? <MetricGrid /> : null}
    {mode === 'settings' ? <WorkflowCards /> : null}
  </div>
)

export default CommercePage
