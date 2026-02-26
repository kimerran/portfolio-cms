export interface TechBadgeProps {
  name: string
  color?: string | null
  category?: string | null
}

export function TechBadge({ name, color }: TechBadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
      style={{ backgroundColor: color ?? '#6366F1' }}
    >
      {name}
    </span>
  )
}
