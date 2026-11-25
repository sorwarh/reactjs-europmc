const EUROPE_PMC_SEARCH_URL =
  'https://www.ebi.ac.uk/europepmc/webservices/rest/search'

export const PAGE_SIZE = 25

/**
 * Search Europe PMC and return one page of articles.
 *
 * @param {string} query - Europe PMC search query.
 * @param {string} [cursorMark] - Cursor for the page to load. "*" starts at page one.
 * @returns {Promise<{ total: number, articles: object[], nextCursorMark: string | null }>}
 */
export async function searchArticles(query, cursorMark = '*') {
  const url = buildSearchUrl(query, cursorMark)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Europe PMC returned ${response.status}. Please try again.`)
  }

  const payload = await response.json()

  return {
    total: payload.hitCount ?? 0,
    articles: (payload.resultList?.result ?? []).map(toArticle),
    nextCursorMark: getNextCursorMark(payload.nextCursorMark, cursorMark),
  }
}

function buildSearchUrl(query, cursorMark) {
  const params = new URLSearchParams({
    query,
    format: 'json',
    pageSize: PAGE_SIZE,
    cursorMark,
  })

  return `${EUROPE_PMC_SEARCH_URL}?${params.toString()}`
}

// Europe PMC repeats the same cursor on the last page, so that means "no more".
function getNextCursorMark(nextCursorMark, currentCursorMark) {
  if (!nextCursorMark || nextCursorMark === currentCursorMark) return null
  return nextCursorMark
}

// Keep only the fields the UI actually shows.
function toArticle(article) {
  return {
    id: `${article.source}:${article.id}`,
    title: article.title,
    authors: article.authorString ?? '',
    journal: article.journalTitle ?? '',
    year: article.pubYear ?? '',
    url: getArticleUrl(article),
  }
}

function getArticleUrl({ pmcid, pmid }) {
  if (pmcid) return `https://europepmc.org/article/PMC/${pmcid}`
  if (pmid) return `https://europepmc.org/article/MED/${pmid}`
  return null
}
