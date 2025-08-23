import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface UseCaseCardProps {
  icon: ReactNode
  title: string
}

export function UseCaseCard({ icon, title }: UseCaseCardProps) {
  return (
    <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="mb-4 text-primary bg-primary/10 p-3 rounded-full">{icon}</div>
        <h3 className="text-lg font-medium">{title}</h3>
      </CardContent>
    </Card>
  )
}

