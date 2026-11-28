function sendJson(response, status, body) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

function getQuery(request) {
  if (typeof request.query?.q === "string") {
    return request.query.q;
  }

  const requestUrl = new URL(
    request.url || "/",
    `http://${request.headers?.host || "localhost"}`,
  );
  return requestUrl.searchParams.get("q") || "";
}

function getSafeResults(payload) {
  if (!Array.isArray(payload?.web?.results)) return [];

  return payload.web.results
    .map((result) => {
      try {
        const url = new URL(result.url);
        if (url.protocol !== "https:" && url.protocol !== "http:") return null;
        if (typeof result.title !== "string") return null;

        return {
          title: result.title.slice(0, 160),
          url: url.toString(),
          description:
            typeof result.description === "string"
              ? result.description.slice(0, 400)
              : "",
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .slice(0, 5);
}

function getSafeWikipediaResults(payload) {
  if (!Array.isArray(payload?.query?.search)) return [];

  return payload.query.search
    .map((result) => {
      if (typeof result.title !== "string") return null;

      const description = typeof result.snippet === "string"
        ? result.snippet
          .replace(/<[^>]*>/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, "\"")
          .replace(/&#039;|&#39;/g, "'")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim()
        : "";

      return {
        title: result.title.slice(0, 160),
        url: `https://pt.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, "_"))}`,
        description: description.slice(0, 400),
      };
    })
    .filter(Boolean)
    .slice(0, 5);
}

export default async function searchHandler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { error: "Método não permitido." });
  }

  const query = getQuery(request).trim();
  if (!query || query.length > 120) {
    return sendJson(response, 400, { error: "Informe um termo de busca válido." });
  }

  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  const endpoint = apiKey
    ? new URL("https://api.search.brave.com/res/v1/web/search")
    : new URL("https://pt.wikipedia.org/w/api.php");
  if (apiKey) {
    endpoint.searchParams.set("q", query);
    endpoint.searchParams.set("count", "5");
    endpoint.searchParams.set("country", "BR");
    endpoint.searchParams.set("search_lang", "pt-br");
    endpoint.searchParams.set("safesearch", "moderate");
  } else {
    endpoint.searchParams.set("action", "query");
    endpoint.searchParams.set("list", "search");
    endpoint.searchParams.set("srsearch", query);
    endpoint.searchParams.set("format", "json");
    endpoint.searchParams.set("utf8", "1");
    endpoint.searchParams.set("srlimit", "5");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const upstreamResponse = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        ...(apiKey
          ? { "X-Subscription-Token": apiKey }
          : { "User-Agent": "NuBanko/0.1 (educational finance app)" }),
      },
      signal: controller.signal,
    });

    if (!upstreamResponse.ok) {
      console.error(`A busca Brave retornou HTTP ${upstreamResponse.status}.`);
      return sendJson(response, 502, { error: "A busca externa falhou." });
    }

    const payload = await upstreamResponse.json();
    const results = apiKey
      ? getSafeResults(payload)
      : getSafeWikipediaResults(payload);
    return sendJson(response, 200, { results });
  } catch (error) {
    console.error("Não foi possível consultar a busca Brave.", error);
    return sendJson(response, 502, { error: "Não foi possível consultar a busca externa." });
  } finally {
    clearTimeout(timeout);
  }
}
