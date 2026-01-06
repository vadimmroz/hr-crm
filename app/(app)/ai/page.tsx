import { AISearch } from "@/components/ai-search"

export default function AIPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">AI</h1>
        <p className="text-muted-foreground text-sm">
          Пошук по джерелах + пояснення (shadcn UI).
        </p>
      </div>
      <AISearch />
    </div>
  )
}

