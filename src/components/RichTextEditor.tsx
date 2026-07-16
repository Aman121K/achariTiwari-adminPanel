import { useEffect, useId, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Braces, Code, Heading2, Heading3,
  Heading4, ImagePlus, Italic, Link2, Link2Off, List, ListOrdered, Minus,
  Pilcrow, Quote, Redo2, RemoveFormatting, Strikethrough, Underline as UnderlineIcon, Undo2,
} from 'lucide-react'

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  helpText?: string
  required?: boolean
  id?: string
}

const hasHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value)
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const toEditorHtml = (value: string) => {
  if (!value) return ''
  if (hasHtml(value)) return value
  return value.split(/\n{2,}/).map(line => `<p>${escapeHtml(line).replace(/\n/g, '<br>')}</p>`).join('')
}
const cleanHtml = (html: string, text: string) => text.trim() ? html : ''
const safeUrl = (raw: string, image = false) => {
  const value = raw.trim()
  if (!value) return ''
  const candidate = !image && /^(www\.)/i.test(value) ? `https://${value}` : value
  try {
    const url = new URL(candidate, window.location.origin)
    if (image) return url.protocol === 'https:' ? url.href : ''
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? candidate : ''
  } catch { return '' }
}

function ToolButton({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick}
    className={`grid h-8 w-8 shrink-0 place-items-center border text-slate-600 transition focus:outline-none focus:ring-2 focus:ring-[#8b1e2d] focus:ring-offset-1 disabled:opacity-35 ${active ? 'border-[#8b1e2d] bg-[#8b1e2d] text-white' : 'border-transparent hover:border-[#d9c9b2] hover:bg-[#fffaf0] hover:text-[#721827]'}`}>
    {children}
  </button>
}

export default function RichTextEditor({ value, onChange, label, helpText, required, id }: RichTextEditorProps) {
  const generatedId = useId(); const editorId = id || generatedId
  const [dialog, setDialog] = useState<'link' | 'image' | null>(null)
  const [url, setUrl] = useState(''); const [alt, setAlt] = useState(''); const [dialogError, setDialogError] = useState('')
  const [source, setSource] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false, underline: false }), Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' } }),
      Image.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Write a thoughtful, useful description…' }),
    ],
    content: toEditorHtml(value),
    editorProps: { attributes: { id: editorId, role: 'textbox', 'aria-multiline': 'true', 'aria-label': label || 'Rich text editor', class: 'rich-editor-content min-h-[260px] px-6 py-5 text-[16px] leading-7 text-slate-800 outline-none' } },
    onUpdate: ({ editor }) => onChange(cleanHtml(editor.getHTML(), editor.getText())),
  })

  useEffect(() => {
    if (!editor) return
    const incoming = toEditorHtml(value); const current = cleanHtml(editor.getHTML(), editor.getText())
    if (incoming !== current) editor.commands.setContent(incoming, { emitUpdate: false })
  }, [editor, value])

  if (!editor) return <div className="h-80 animate-pulse border border-[#ddcfba] bg-[#fffdf7]" aria-label="Loading editor" />
  const words = editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0
  const characters = editor.getText().length
  const openLink = () => { setUrl(editor.getAttributes('link').href || ''); setDialogError(''); setDialog('link') }
  const applyLink = () => { const valid = safeUrl(url); if (!valid) { setDialogError('Enter a valid web, email, or telephone link.'); return } editor.chain().focus().extendMarkRange('link').setLink({ href: valid }).run(); setDialog(null) }
  const insertImage = () => { const valid = safeUrl(url, true); if (!valid) { setDialogError('Images must use a valid HTTPS URL.'); return } editor.chain().focus().setImage({ src: valid, alt: alt.trim() }).run(); setDialog(null) }
  const icon = 16

  return <div className="grid gap-2">
    {label && <label htmlFor={editorId} className="text-sm font-semibold text-slate-700">{label}{required && <span className="ml-1 text-[#8b1e2d]">*</span>}</label>}
    <div className="overflow-hidden border border-[#ddcfba] bg-[#fffdf7] shadow-[0_1px_0_rgba(82,49,24,.05)] focus-within:border-[#8b1e2d] focus-within:ring-2 focus-within:ring-[#8b1e2d]/15">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#ddcfba] bg-[#f8f0e2] px-2 py-2" role="toolbar" aria-label="Text formatting">
        <ToolButton label="Paragraph" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow size={icon}/></ToolButton>
        <ToolButton label="Heading 2" active={editor.isActive('heading',{level:2})} onClick={() => editor.chain().focus().toggleHeading({level:2}).run()}><Heading2 size={icon}/></ToolButton>
        <ToolButton label="Heading 3" active={editor.isActive('heading',{level:3})} onClick={() => editor.chain().focus().toggleHeading({level:3}).run()}><Heading3 size={icon}/></ToolButton>
        <ToolButton label="Heading 4" active={editor.isActive('heading',{level:4})} onClick={() => editor.chain().focus().toggleHeading({level:4}).run()}><Heading4 size={icon}/></ToolButton>
        <span className="mx-1 h-6 w-px bg-[#d9c9b2]" />
        <ToolButton label="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={icon}/></ToolButton>
        <ToolButton label="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={icon}/></ToolButton>
        <ToolButton label="Underline (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={icon}/></ToolButton>
        <ToolButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={icon}/></ToolButton>
        <ToolButton label="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}><Code size={icon}/></ToolButton>
        <span className="mx-1 h-6 w-px bg-[#d9c9b2]" />
        <ToolButton label="Bulleted list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={icon}/></ToolButton>
        <ToolButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={icon}/></ToolButton>
        <ToolButton label="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={icon}/></ToolButton>
        <ToolButton label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Braces size={icon}/></ToolButton>
        <span className="mx-1 h-6 w-px bg-[#d9c9b2]" />
        <ToolButton label="Align left" active={editor.isActive({textAlign:'left'})} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={icon}/></ToolButton>
        <ToolButton label="Align center" active={editor.isActive({textAlign:'center'})} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={icon}/></ToolButton>
        <ToolButton label="Align right" active={editor.isActive({textAlign:'right'})} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={icon}/></ToolButton>
        <ToolButton label="Add or edit link" active={editor.isActive('link')} onClick={openLink}><Link2 size={icon}/></ToolButton>
        <ToolButton label="Remove link" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}><Link2Off size={icon}/></ToolButton>
        <ToolButton label="Insert image" onClick={() => { setUrl(''); setAlt(''); setDialogError(''); setDialog('image') }}><ImagePlus size={icon}/></ToolButton>
        <ToolButton label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={icon}/></ToolButton>
        <ToolButton label="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><RemoveFormatting size={icon}/></ToolButton>
        <ToolButton label="Undo (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={icon}/></ToolButton>
        <ToolButton label="Redo (Ctrl+Shift+Z)" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={icon}/></ToolButton>
      </div>
      {dialog && <div className="border-b border-[#ddcfba] bg-white px-4 py-3" role="dialog" aria-label={dialog === 'link' ? 'Add link' : 'Insert image'}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="grid flex-1 gap-1 text-xs font-semibold uppercase tracking-wide text-slate-600">{dialog === 'link' ? 'Destination URL' : 'HTTPS image URL'}<input autoFocus value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')setDialog(null); if(e.key==='Enter'){e.preventDefault(); dialog==='link'?applyLink():insertImage()}}} placeholder={dialog === 'link' ? 'https://example.com' : 'https://example.com/image.jpg'} className="h-10 border border-[#cdbb9e] px-3 text-sm normal-case tracking-normal outline-none focus:border-[#8b1e2d] focus:ring-2 focus:ring-[#8b1e2d]/15" /></label>
          {dialog === 'image' && <label className="grid flex-1 gap-1 text-xs font-semibold uppercase tracking-wide text-slate-600">Alternative text<input value={alt} onChange={e=>setAlt(e.target.value)} placeholder="Describe the image" className="h-10 border border-[#cdbb9e] px-3 text-sm normal-case tracking-normal outline-none focus:border-[#8b1e2d]" /></label>}
          <div className="flex gap-2"><button type="button" onClick={()=>setDialog(null)} className="h-10 border border-[#cdbb9e] px-3 text-sm font-semibold text-slate-600">Cancel</button><button type="button" onClick={dialog==='link'?applyLink:insertImage} className="h-10 bg-[#8b1e2d] px-4 text-sm font-semibold text-white">{dialog==='link'?'Apply link':'Insert image'}</button></div></div>
        {dialogError && <p role="alert" className="mt-2 text-xs font-medium text-red-700">{dialogError}</p>}
      </div>}
      {source ? (
        <pre className="min-h-[260px] overflow-auto whitespace-pre-wrap px-6 py-5 font-mono text-sm leading-6 text-slate-700">
          {editor.getHTML()}
        </pre>
      ) : (
        <EditorContent editor={editor} />
      )}
      <footer className="flex items-center justify-between border-t border-[#ddcfba] bg-[#faf4e9] px-4 py-2 text-[11px] font-semibold uppercase tracking-[.12em] text-slate-500">
        <span><i className="mr-2 inline-block h-1.5 w-1.5 bg-[#d9901a]"/>Rich text</span>
        <span className="flex items-center gap-4"><button type="button" onClick={()=>setSource(!source)} className="normal-case tracking-normal text-[#721827] underline-offset-2 hover:underline">{source?'Return to editor':'View HTML'}</button><span>{words} {words===1?'word':'words'}</span><span>{characters} characters</span></span>
      </footer>
    </div>
    {helpText && <p id={`${editorId}-help`} className="text-xs leading-5 text-slate-500">{helpText}</p>}
    {required && <textarea tabIndex={-1} aria-hidden="true" required value={editor.getText().trim()} onChange={()=>{}} className="pointer-events-none absolute h-px w-px opacity-0" />}
  </div>
}
