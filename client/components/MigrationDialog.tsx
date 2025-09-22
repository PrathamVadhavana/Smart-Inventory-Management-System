import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Database, Download, Trash2 } from 'lucide-react'
import { migrateFromLocalStorage, clearLocalStorage, backupLocalStorage, MigrationResult } from '@/lib/migration'
import { simpleMigrateFromLocalStorage, SimpleMigrationResult } from '@/lib/simpleMigration'
import { useToast } from '@/hooks/use-toast'

interface MigrationDialogProps {
  children: React.ReactNode
}

export default function MigrationDialog({ children }: MigrationDialogProps) {
  const [open, setOpen] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<MigrationResult | SimpleMigrationResult | null>(null)
  const [step, setStep] = useState('')
  const { toast } = useToast()

  const handleMigration = async () => {
    setMigrating(true)
    setProgress(0)
    setResult(null)
    setStep('Starting migration...')

    try {
      // Step 1: Backup
      setProgress(20)
      setStep('Creating backup...')
      backupLocalStorage()
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 2: Migrate data
      setProgress(40)
      setStep('Migrating data to Supabase...')
      let migrationResult = await migrateFromLocalStorage()

      // If migration fails due to constraint issues, try simple migration
      if (!migrationResult.success && migrationResult.message.includes('constraint')) {
        setStep('Retrying with simple migration...')
        migrationResult = await simpleMigrateFromLocalStorage()
      }

      setProgress(80)
      setStep('Finalizing...')
      await new Promise(resolve => setTimeout(resolve, 1000))

      setProgress(100)
      setStep('Migration completed!')
      setResult(migrationResult)

      if (migrationResult.success) {
        toast({
          title: "Migration Successful",
          description: migrationResult.message,
        })
      } else {
        toast({
          title: "Migration Failed",
          description: migrationResult.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      setProgress(0)
      setStep('Migration failed')
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        counts: { products: 0, customers: 0, orders: 0 }
      })
      toast({
        title: "Migration Error",
        description: "An error occurred during migration",
        variant: "destructive",
      })
    } finally {
      setMigrating(false)
    }
  }

  const handleClearLocalStorage = () => {
    clearLocalStorage()
    toast({
      title: "Local Storage Cleared",
      description: "All local data has been removed",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Migrate to Supabase
          </DialogTitle>
          <DialogDescription>
            Migrate your local data to Supabase database. This will create a backup and transfer all your products, customers, and orders.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {migrating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{step}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                {result.message}
                {result.success && (
                  <div className="mt-2 text-sm">
                    <div>Products: {result.counts.products}</div>
                    <div>Customers: {result.counts.customers}</div>
                    <div>Orders: {result.counts.orders}</div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {!migrating && !result && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                This will:
              </div>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Create a backup of your local data</li>
                <li>• Transfer products to Supabase</li>
                <li>• Transfer customers to Supabase</li>
                <li>• Transfer orders to Supabase</li>
                <li>• Keep your local data as backup</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!migrating && !result && (
            <>
              <Button variant="outline" onClick={() => backupLocalStorage()}>
                <Download className="w-4 h-4 mr-2" />
                Backup Only
              </Button>
              <Button onClick={handleMigration}>
                <Database className="w-4 h-4 mr-2" />
                Start Migration
              </Button>
            </>
          )}

          {result && result.success && (
            <Button variant="destructive" onClick={handleClearLocalStorage}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Local Data
            </Button>
          )}

          {!migrating && (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

