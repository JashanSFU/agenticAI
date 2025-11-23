"use client";

import useSWR from "swr";
import { ScrollArea } from "@/components/ui/scroll-area";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MeetingsPage() {
  const { data: meetings } = useSWR("/api/debug/meetings", fetcher);

  const byDate: any = {};
  meetings?.forEach((m: any) => {
    if (!byDate[m.date]) byDate[m.date] = [];
    byDate[m.date].push(m);
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">📅 Meetings</h1>

      <ScrollArea className="h-[78vh] border rounded-md p-4">
        {!meetings?.length && (
          <p className="text-muted-foreground">No meetings yet.</p>
        )}

        {Object.keys(byDate).map((date) => (
          <div key={date} className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{date}</h2>

            <div className="space-y-3">
              {byDate[date].map((m: any) => (
                <div key={m.id} className="border rounded-md p-3">
                  <p className="font-medium">{m.title}</p>
                  <p className="text-sm text-muted-foreground">{m.time}</p>
                  {m.attendees?.length > 0 && (
                    <p className="text-xs mt-1">👥 {m.attendees.join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
