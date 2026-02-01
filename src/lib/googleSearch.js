/**
 * Google Custom Search JSON API Integration
 * 
 * To use this module:
 * 1. Create a Programmable Search Engine at https://programmablesearchengine.google.com/
 * 2. Enable "Search the entire web" in your search engine settings
 * 3. Get an API key from Google Cloud Console (enable Custom Search API)
 * 4. Add VITE_GOOGLE_API_KEY and VITE_GOOGLE_SEARCH_ENGINE_ID to your .env
 */

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

/**
 * Perform a Google Custom Search
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @param {number} options.num - Number of results (1-10, default 10)
 * @param {number} options.start - Start index for pagination (default 1)
 * @param {string} options.siteSearch - Restrict search to a specific site
 * @param {string} options.dateRestrict - Restrict by date (e.g., 'd7' for last 7 days, 'm3' for 3 months)
 * @returns {Promise<Array>} Array of search results
 */
export async function googleSearch(query, options = {}) {
  if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
    throw new Error(
      "Google Search API credentials missing. Add VITE_GOOGLE_API_KEY and VITE_GOOGLE_SEARCH_ENGINE_ID to your .env file."
    );
  }

  const { num = 10, start = 1, siteSearch, dateRestrict } = options;

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", GOOGLE_API_KEY);
  url.searchParams.set("cx", SEARCH_ENGINE_ID);
  url.searchParams.set("q", query);
  url.searchParams.set("num", Math.min(num, 10)); // Max 10 per request
  url.searchParams.set("start", start);

  if (siteSearch) {
    url.searchParams.set("siteSearch", siteSearch);
  }

  if (dateRestrict) {
    url.searchParams.set("dateRestrict", dateRestrict);
  }

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `Search failed: ${response.statusText}`);
  }

  const data = await response.json();

  return (
    data.items?.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink,
      thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src || null,
    })) || []
  );
}

/**
 * Search specifically for learning resources (YouTube, tutorials, docs)
 * @param {string} topic - The topic to search for
 * @param {string} resourceType - Type of resource: 'video', 'article', 'tutorial', 'documentation'
 * @returns {Promise<Array>} Array of search results
 */
export async function searchLearningResources(topic, resourceType = "all") {
  const typeQueries = {
    video: `${topic} tutorial site:youtube.com OR site:vimeo.com`,
    article: `${topic} tutorial OR guide OR introduction`,
    tutorial: `${topic} step by step tutorial beginner`,
    documentation: `${topic} official documentation OR docs`,
    all: `${topic} learn tutorial guide`,
  };

  const query = typeQueries[resourceType] || typeQueries.all;
  return googleSearch(query, { num: 5 });
}

/**
 * Search and format results as context for Gemini
 * @param {string} query - The search query
 * @returns {Promise<string>} Formatted search context
 */
export async function searchForContext(query) {
  try {
    const results = await googleSearch(query, { num: 5 });

    if (results.length === 0) {
      return "No search results found.";
    }

    return results
      .map((r, i) => `[${i + 1}] ${r.title}\n    URL: ${r.link}\n    ${r.snippet}`)
      .join("\n\n");
  } catch (error) {
    console.error("Search failed:", error);
    return `Search error: ${error.message}`;
  }
}

/**
 * Check if Google Search is properly configured
 * @returns {boolean}
 */
export function isGoogleSearchConfigured() {
  return Boolean(GOOGLE_API_KEY && SEARCH_ENGINE_ID);
}
