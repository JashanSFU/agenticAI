"use client";

import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LeadsPage() {
  const { data } = useSWR("/api/debug/leads", fetcher);

  const leads = data?.leads ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">📇 CRM Leads</h1>

      <ScrollArea className="h-[78vh] rounded-md border p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Company</th>
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {leads.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-4 text-center text-muted-foreground"
                >
                  No leads yet.
                </td>
              </tr>
            )}

            {leads.map((l: any) => (
              <tr key={l.id} className="border-b hover:bg-muted/30">
                <td className="py-3">{l.name}</td>
                <td>{l.company || "-"}</td>
                <td className="text-xs">{l.email || "-"}</td>
                <td>
                  <Badge variant="outline" className="capitalize">
                    {l.status || "new"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
