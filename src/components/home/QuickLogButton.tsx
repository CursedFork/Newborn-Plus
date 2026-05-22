import { cn } from '@/lib/utils'

interface Props {
  icon: React.ReactNode
  label: string
  color: string
  onClick: () => void
}

export default function QuickLogButton({ icon, label, color, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-2xl p-6 text-white',
        'active:scale-95 transition-transform min-h-[100px]',
        color
      )}
    >
      {icon}
      <span className="text-base font-semibold">{label}</span>
    </button>
  )
}
