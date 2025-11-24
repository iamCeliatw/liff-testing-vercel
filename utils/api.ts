export const callApi = async (
  url: string,
  method: string,
  body?: Record<string, unknown>,
  mgmcode?: string
) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // 如果有 mgmcode 就加到 header
  if (mgmcode) {
    headers["mgmcode"] = mgmcode;
  }

  const response = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers,
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
