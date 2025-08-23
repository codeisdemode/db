import { Check, X } from "lucide-react"

interface ComparisonFeature {
  name: string
  columnist: boolean
  supabase: boolean
  neon: boolean
}

interface ComparisonTableProps {
  features: ComparisonFeature[]
}

export function ComparisonTable({ features }: ComparisonTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 bg-muted/50">Feature</th>
            <th className="p-4 bg-primary/10 text-primary font-bold">Columnist</th>
            <th className="p-4 bg-muted/50">Supabase</th>
            <th className="p-4 bg-muted/50">Neon</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className="border-t border-border">
              <td className="p-4 font-medium">{feature.name}</td>
              <td className="p-4 text-center bg-primary/5">
                {feature.columnist ? (
                  <div className="flex justify-center">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </td>
              <td className="p-4 text-center">
                {feature.supabase ? (
                  <div className="flex justify-center">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </td>
              <td className="p-4 text-center">
                {feature.neon ? (
                  <div className="flex justify-center">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

