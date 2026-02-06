import { useLogs, useClearLogs } from "@/hooks/use-logs";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { History as HistoryIcon, Trash2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function History() {
  const { data: logs, isLoading } = useLogs();
  const { mutate: clearLogs, isPending: isClearing } = useClearLogs();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 lg:ml-72 p-6 lg:p-12 overflow-y-auto">
        <PageHeader 
          title="Operation Logs" 
          description="Audit trail of all encoding and decoding activities."
          icon={<HistoryIcon className="h-8 w-8" />}
          action={
            <Button 
              variant="destructive" 
              onClick={() => clearLogs()} 
              disabled={isClearing || !logs?.length}
              className="bg-destructive/20 hover:bg-destructive/40 text-red-400 border border-destructive/50"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear History
            </Button>
          }
        />

        <div className="bg-card border border-white/5 rounded-xl overflow-hidden shadow-2xl">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeleton
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell><div className="h-4 w-24 bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-32 bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-12 bg-white/5 rounded animate-pulse ml-auto" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-white/5 rounded animate-pulse ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : logs?.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="h-64 text-center text-muted-foreground">
                    No operations recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs?.map((log) => (
                  <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.createdAt && format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded text-xs font-medium border",
                        log.operation === "encode" 
                          ? "bg-primary/10 text-primary border-primary/20" 
                          : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      )}>
                        {log.operation.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-white font-medium">{log.fileName}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {(log.fileSize / 1024).toFixed(1)} KB
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-2">
                         {log.success ? (
                           <>
                             <span className="text-xs text-green-400">Success</span>
                             <CheckCircle className="h-4 w-4 text-green-400" />
                           </>
                         ) : (
                           <>
                             <span className="text-xs text-red-400">Failed</span>
                             <XCircle className="h-4 w-4 text-red-400" />
                           </>
                         )}
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
