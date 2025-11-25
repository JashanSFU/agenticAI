"use client";

import useSWR from "swr";
import { ScrollArea } from "@/components/ui/scroll-area";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MeetingsPage() {
  const { data } = useSWR("/api/debug/meetings", fetcher);

  const meetings = data?.events ?? [];

  // Group meetings by YYYY-MM-DD (Vancouver Time)
  const grouped: Record<string, any[]> = {};

  meetings.forEach((m: any) => {
    const date = new Date(m.start_time).toLocaleDateString("en-CA", {
      timeZone: "America/Vancouver",
    });

    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(m);
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">📅 Meetings</h1>

      <ScrollArea className="h-[78vh] border rounded-md p-4">
        {meetings.length === 0 && (
          <p className="text-muted-foreground">No meetings yet.</p>
        )}

        {Object.keys(grouped).map((date) => (
          <div key={date} className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{date}</h2>

            <div className="space-y-3">
              {grouped[date].map((m) => {
                const time = new Date(m.start_time).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "America/Vancouver",
                  }
                );

                return (
                  <div key={m.id} className="border rounded-md p-3">
                    <p className="font-medium">{m.title}</p>
                    <p className="text-sm text-muted-foreground">{time}</p>

                    {m.attendees?.length > 0 && (
                      <p className="text-xs mt-1">
                        👥 {m.attendees.join(", ")}
                      </p>
                    )}

                    {m.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {m.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
