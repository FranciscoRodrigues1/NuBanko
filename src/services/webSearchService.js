function isValidSearchResult(result) {
  if (!result || typeof result.title !== "string" || typeof result.url !== "string") {
    return false;
  }

  try {
    const url = new URL(result.url);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function searchWeb(query) {
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}`,
    { headers: { Accept: "application/json" } },
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "A busca externa não está disponível.");
  }
  if (!Array.isArray(data.results)) {
    throw new Error("A resposta da busca externa não tem o formato esperado.");
  }

  return {
    results: data.results
      .filter(isValidSearchResult)
      .map((result) => ({
        title: result.title,
        url: result.url,
        description:
          typeof result.description === "string" ? result.description : "",
      })),
  };
}
