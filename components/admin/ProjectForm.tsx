'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { slugify } from '@/lib/utils'
import { X, Plus, GripVertical, Trash2, Save, Globe } from 'lucide-react'

interface TechTagInput {
  id?: string
  name: string
  category: string
  color: string
}

interface ScreenshotInput {
  id?: string
  url: string
  altText: string
  order: number
}

interface FormState {
  title: string
  slug: string
  summary: string
  coverImageUrl: string
  liveDemoUrl: string
  youtubeUrl: string
  published: boolean
  sortOrder: number
  techStack: TechTagInput[]
  screenshots: ScreenshotInput[]
}

export interface ProjectFormProps {
  projectId?: string
  initialData?: Partial<FormState & { description: string }>
}

const TECH_CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Database', 'Other']

export function ProjectForm({ projectId, initialData }: ProjectFormProps) {
  const router = useRouter()
  const isEdit = Boolean(projectId)

  const [form, setForm] = useState<FormState>({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    summary: initialData?.summary ?? '',
    coverImageUrl: initialData?.coverImageUrl ?? '',
    liveDemoUrl: initialData?.liveDemoUrl ?? '',
    youtubeUrl: initialData?.youtubeUrl ?? '',
    published: initialData?.published ?? false,
    sortOrder: initialData?.sortOrder ?? 0,
    techStack: initialData?.techStack ?? [],
    screenshots: initialData?.screenshots ?? [],
  })

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6366F1')
  const [newTagCategory, setNewTagCategory] = useState('Other')
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage,
      Placeholder.configure({ placeholder: 'Write your project description…' }),
    ],
    content: initialData?.description ?? '',
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none min-h-[200px] focus:outline-none px-4 py-3',
      },
    },
  })

  const setField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  // Auto-generate slug from title in create mode
  useEffect(() => {
    if (!isEdit && form.title && !initialData?.slug) {
      setField('slug', slugify(form.title))
    }
  }, [form.title, isEdit, initialData?.slug, setField])

  // Auto-save debounced (edit mode only)
  const scheduleAutoSave = useCallback(() => {
    if (!isEdit) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      void save(false)
    }, 1500)
  }, [isEdit]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [])

  async function save(showFeedback = true) {
    setSaving(true)
    setSaveError('')

    const payload = {
      ...form,
      description: editor?.getHTML() ?? '',
    }

    try {
      let res: Response
      if (isEdit) {
        res = await fetch(`/api/admin/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setSaveError(data.error ?? 'Failed to save project')
        return
      }

      const project = (await res.json()) as { id: string }

      if (showFeedback) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }

      if (!isEdit) {
        router.push(`/admin/projects/${project.id}/edit`)
      }
    } catch {
      setSaveError('Network error. Changes not saved.')
    } finally {
      setSaving(false)
    }
  }

  async function publish() {
    setField('published', true)
    await save(true)
  }

  function addTag() {
    const name = newTagName.trim()
    if (!name) return
    if (form.techStack.some((t) => t.name.toLowerCase() === name.toLowerCase())) return

    setField('techStack', [
      ...form.techStack,
      { name, category: newTagCategory, color: newTagColor },
    ])
    setNewTagName('')
  }

  function removeTag(index: number) {
    setField(
      'techStack',
      form.techStack.filter((_, i) => i !== index),
    )
  }

  function addScreenshot(url: string) {
    setField('screenshots', [
      ...form.screenshots,
      { url, altText: '', order: form.screenshots.length },
    ])
  }

  function removeScreenshot(index: number) {
    setField(
      'screenshots',
      form.screenshots
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i })),
    )
  }

  function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const items = Array.from(form.screenshots)
    const [moved] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, moved)
    setField(
      'screenshots',
      items.map((s, i) => ({ ...s, order: i })),
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              form.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {form.published ? 'Published' : 'Draft'}
          </span>
          {saveSuccess && (
            <span className="text-xs text-green-600">Saved</span>
          )}
          {saveError && <span className="text-xs text-red-600">{saveError}</span>}
        </div>
        <div className="flex gap-3">
          {!form.published && (
            <Button variant="secondary" size="sm" onClick={() => void publish()} loading={saving}>
              <Globe className="h-4 w-4" />
              Publish
            </Button>
          )}
          <Button size="sm" onClick={() => void save(true)} loading={saving}>
            <Save className="h-4 w-4" />
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </div>

      {/* Basic fields */}
      <div className="grid gap-6 rounded-card border border-brand-border bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Basic info
        </h2>

        <Input
          id="title"
          label="Title *"
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          onBlur={scheduleAutoSave}
          placeholder="My Awesome Project"
          required
        />

        <Input
          id="slug"
          label="Slug *"
          value={form.slug}
          onChange={(e) => setField('slug', e.target.value)}
          onBlur={scheduleAutoSave}
          placeholder="my-awesome-project"
        />

        <Textarea
          id="summary"
          label="Summary (max 300 chars)"
          value={form.summary}
          onChange={(e) => setField('summary', e.target.value.slice(0, 300))}
          onBlur={scheduleAutoSave}
          rows={3}
          placeholder="A short 2–3 sentence summary of the project."
        />
        <p className="text-xs text-slate-400">{form.summary.length}/300</p>

        <Input
          id="liveDemoUrl"
          label="Live Demo URL"
          type="url"
          value={form.liveDemoUrl}
          onChange={(e) => setField('liveDemoUrl', e.target.value)}
          onBlur={scheduleAutoSave}
          placeholder="https://myproject.com"
        />

        <Input
          id="youtubeUrl"
          label="YouTube URL (full or embed)"
          type="url"
          value={form.youtubeUrl}
          onChange={(e) => setField('youtubeUrl', e.target.value)}
          onBlur={scheduleAutoSave}
          placeholder="https://www.youtube.com/watch?v=..."
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="sortOrder"
            label="Sort order (lower = first)"
            type="number"
            value={String(form.sortOrder)}
            onChange={(e) => setField('sortOrder', parseInt(e.target.value, 10) || 0)}
            onBlur={scheduleAutoSave}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setField('published', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
              />
              <span className="text-sm text-slate-700">Published</span>
            </label>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-card border border-brand-border bg-white">
        <div className="border-b border-brand-border px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Description / Writeup
          </h2>
        </div>
        {/* Tiptap toolbar */}
        {editor && (
          <div className="flex flex-wrap gap-1 border-b border-brand-border px-3 py-2">
            {[
              { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
              { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
              { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
              { label: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
              { label: 'UL', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
              { label: 'OL', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
              { label: '„', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
              { label: '<>', action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={btn.action}
                className={`rounded px-2 py-1 text-xs font-mono font-bold transition-colors ${
                  btn.active ? 'bg-brand-accent text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
        <div
          onClick={() => editor?.chain().focus().run()}
          className="min-h-[250px] cursor-text"
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Cover Image */}
      <div className="rounded-card border border-brand-border bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Cover image
        </h2>
        <ImageUploader
          label="Cover image"
          currentUrl={form.coverImageUrl || null}
          type="cover"
          projectId={projectId}
          onUpload={(url) => {
            setField('coverImageUrl', url)
            scheduleAutoSave()
          }}
          onRemove={() => setField('coverImageUrl', '')}
        />
      </div>

      {/* Tech Stack */}
      <div className="rounded-card border border-brand-border bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Tech stack
        </h2>

        {form.techStack.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {form.techStack.map((tag, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: tag.color || '#6366F1' }}
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => removeTag(i)}
                  className="ml-0.5 opacity-70 hover:opacity-100"
                  aria-label={`Remove ${tag.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <Input
            id="newTagName"
            label="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="React"
            className="w-32"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newTagCategory" className="text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="newTagCategory"
              value={newTagCategory}
              onChange={(e) => setNewTagCategory(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              {TECH_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newTagColor" className="text-sm font-medium text-slate-700">
              Color
            </label>
            <input
              id="newTagColor"
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-lg border border-slate-300 p-1"
            />
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={addTag}>
            <Plus className="h-4 w-4" />
            Add tag
          </Button>
        </div>
      </div>

      {/* Screenshots */}
      <div className="rounded-card border border-brand-border bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Screenshots ({form.screenshots.length}/10)
        </h2>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="screenshots">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="mb-4 flex flex-col gap-2">
                {form.screenshots.map((s, i) => (
                  <Draggable key={s.url + i} draggableId={s.url + i} index={i}>
                    {(draggable) => (
                      <div
                        ref={draggable.innerRef}
                        {...draggable.draggableProps}
                        className="flex items-center gap-3 rounded-lg border border-brand-border bg-slate-50 p-3"
                      >
                        <span
                          {...draggable.dragHandleProps}
                          className="cursor-grab text-slate-400 hover:text-slate-600"
                          aria-label="Drag to reorder"
                        >
                          <GripVertical className="h-5 w-5" />
                        </span>
                        <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded border border-brand-border bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.url} alt={s.altText || `Screenshot ${i + 1}`} className="h-full w-full object-cover" />
                        </div>
                        <input
                          type="text"
                          value={s.altText}
                          onChange={(e) =>
                            setField(
                              'screenshots',
                              form.screenshots.map((sc, idx) =>
                                idx === i ? { ...sc, altText: e.target.value } : sc,
                              ),
                            )
                          }
                          placeholder="Alt text (optional)"
                          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        />
                        <button
                          type="button"
                          onClick={() => removeScreenshot(i)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                          aria-label="Remove screenshot"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {form.screenshots.length < 10 && (
          <ImageUploader
            label=""
            type="screenshot"
            projectId={projectId}
            onUpload={addScreenshot}
          />
        )}
      </div>
    </div>
  )
}
