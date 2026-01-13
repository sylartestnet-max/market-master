export const isNui = (): boolean => {
  return typeof window !== "undefined" && typeof (window as any).GetParentResourceName === "function";
};

export async function fetchNui<TResponse = any>(eventName: string, data: any = {}): Promise<TResponse> {
  if (!isNui()) return {} as TResponse;

  const resource = (window as any).GetParentResourceName();
  const resp = await fetch(`https://${resource}/${eventName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return resp.json();
}
