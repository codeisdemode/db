import type { ReactNode } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface ResourceCardProps {
  icon: ReactNode
  title: string
  description: string
  href?: string
}

export function ResourceCard({ icon, title, description, href = "#" }: ResourceCardProps) {
  return (
    <Link href={href}>
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
        <CardContent className="p-6">
          <div className="mb-4 text-primary">{icon}</div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

