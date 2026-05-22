import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  icon: React.ReactNode
  label: string
  value: string
  /** 'lg' renders the value at a larger size — use for key metrics */
  size?: 'default' | 'lg'
}

export default function StatusCard({ icon, label, value, size = 'default' }: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        <p className={cn(
          'font-semibold tabular-nums leading-tight',
          size === 'lg' ? 'text-xl' : 'text-sm'
        )}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
