export async function getAIInsights() {
  const res = await fetch("http://localhost:3000/api/mcp/insights", {
    method: "POST",
  });
  const json = await res.json();

  return json.data;
}

export async function getDailyReflection() {
  const res = await fetch("http://localhost:3000/api/mcp/reflection/daily", {
    method: "POST",
  });
  const json = await res.json();

  return json.data;
}

export async function getAutoschedule() {
  const res = await fetch(
    "http://localhost:3000/api/mcp/reflection/autoschedule",
    { method: "POST" }
  );
  const json = await res.json();

  return json.data;
}
