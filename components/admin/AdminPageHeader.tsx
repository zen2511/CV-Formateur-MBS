// components/admin/AdminPageHeader.tsx
export default function AdminPageHeader({
  titre, description,
}: {
  titre: string
  description?: string
}) {
  return (
    <div className="px-8 pt-8 pb-2">
      <div className="flex items-center gap-3 mb-1">
        <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: 'var(--cfp-red)' }} />
        <h1 className="text-xl font-semibold text-slate-900">{titre}</h1>
      </div>
      {description && <p className="text-sm text-slate-500 ml-4.5">{description}</p>}
    </div>
  )
}