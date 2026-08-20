interface StatSummaryProps {
  saved: number
  analyzed: number
  uploaded: number
  onSavedClick: () => void
  onAnalyzedClick: () => void
  onUploadedClick: () => void
}

export default function StatSummary({
  saved,
  analyzed,
  uploaded,
  onSavedClick,
  onAnalyzedClick,
  onUploadedClick,
}: StatSummaryProps) {
  const stats = [
    { label: '저장', value: saved, onClick: onSavedClick },
    { label: '분석', value: analyzed, onClick: onAnalyzedClick },
    { label: '업로드', value: uploaded, onClick: onUploadedClick },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 rounded-lg bg-bg-secondary p-4">
      {stats.map(({ label, value, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-lg font-semibold text-text">{value}</span>
          <span className="text-xs text-text-secondary">{label}</span>
        </button>
      ))}
    </div>
  )
}
