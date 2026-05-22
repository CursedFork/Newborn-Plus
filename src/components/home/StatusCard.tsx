import { Card, CardContent } from '@/components/ui/card'

interface Props {
  icon: React.ReactNode
  label: string
  value: string
}

export default function StatusCard({ icon, label, value }: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        <p className="text-sm font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}
