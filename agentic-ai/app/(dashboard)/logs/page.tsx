"use client";

import useSWR from "swr";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LogsPage() {
  const { data: logs } = useSWR("/api/debug/logs", fetcher);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">🧰 Tool Logs</h1>

      {!logs?.length && <p className="text-muted-foreground">No logs yet.</p>}

      <Accordion type="multiple" className="w-full">
        {logs?.map((log: any, i: number) => (
          <AccordionItem key={i} value={`log-${i}`}>
            <AccordionTrigger>
              <span className="text-sm">
                {log.timestamp} — <strong>{log.tool}</strong>
              </span>
            </AccordionTrigger>

            <AccordionContent>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                {JSON.stringify(log, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
