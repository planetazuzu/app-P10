'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary Caught:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg text-center shadow-2xl">
        <CardHeader>
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-2xl font-bold text-destructive">Algo Salió Mal</CardTitle>
          <CardDescription>
            Ocurrió un error inesperado en la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Puedes intentar recargar la página o volver a intentarlo más tarde.
          </p>
          <div className="bg-muted p-3 rounded-md text-left text-xs overflow-auto max-h-40">
            <p className="font-semibold">Detalles del error:</p>
            <pre className="whitespace-pre-wrap">{error.message}</pre>
            {error.digest && <pre className="whitespace-pre-wrap">Digest: {error.digest}</pre>}
          </div>
          <Button onClick={() => reset()} className="btn-primary">
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
