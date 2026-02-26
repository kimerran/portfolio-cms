'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search projects…', className }: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-brand-border bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        aria-label="Search projects"
      />
    </div>
  )
}
