import { afterEach, describe, expect, it, vi } from 'vitest'
import { PAGE_SIZE, searchArticles } from './europePmc.js'

const API_URL = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search'

function jsonResponse(payload) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('searchArticles', () => {
  it('requests the first page with the search parameters', async () => {
    // Arrange
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}))
    vi.stubGlobal('fetch', fetchMock)

    // Act
    await searchArticles('cancer AND immunotherapy')

    // Assert
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = new URL(fetchMock.mock.calls[0][0])
    expect(`${url.origin}${url.pathname}`).toBe(API_URL)
    expect(Object.fromEntries(url.searchParams)).toEqual({
      query: 'cancer AND immunotherapy',
      format: 'json',
      pageSize: String(PAGE_SIZE),
      cursorMark: '*',
    })
  })

  it('sends the given cursor for a later page', async () => {
    // Arrange
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}))
    vi.stubGlobal('fetch', fetchMock)

    // Act
    await searchArticles('cancer', 'cursor-2')

    // Assert
    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.searchParams.get('cursorMark')).toBe('cursor-2')
  })

  it('maps API results to the fields the UI shows', async () => {
    // Arrange
    const payload = {
      hitCount: 42,
      nextCursorMark: 'cursor-2',
      resultList: {
        result: [
          {
            source: 'MED',
            id: '12345',
            title: 'Immune checkpoint therapy',
            authorString: 'Smith J, Doe A.',
            journalTitle: 'Journal of Testing',
            pubYear: '2024',
            pmcid: 'PMC123',
            pmid: '12345',
          },
        ],
      },
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(payload)))

    // Act
    const result = await searchArticles('cancer')

    // Assert
    expect(result).toEqual({
      total: 42,
      articles: [
        {
          id: 'MED:12345',
          title: 'Immune checkpoint therapy',
          authors: 'Smith J, Doe A.',
          journal: 'Journal of Testing',
          year: '2024',
          url: 'https://europepmc.org/article/PMC/PMC123',
        },
      ],
      nextCursorMark: 'cursor-2',
    })
  })

  it.each([
    [
      'a PMC id',
      { source: 'MED', id: '1', pmcid: 'PMC1', pmid: '1' },
      'https://europepmc.org/article/PMC/PMC1',
    ],
    [
      'a PubMed id',
      { source: 'MED', id: '2', pmid: '2' },
      'https://europepmc.org/article/MED/2',
    ],
    ['no Europe PMC id', { source: 'MED', id: '3' }, null],
  ])('builds the article URL from %s', async (label, apiArticle, expectedUrl) => {
    // Arrange
    const payload = { resultList: { result: [apiArticle] } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(payload)))

    // Act
    const { articles } = await searchArticles('cancer')

    // Assert
    expect(articles[0].url).toBe(expectedUrl)
  })

  it('returns no next cursor when the API repeats the current one', async () => {
    // Arrange
    const payload = { nextCursorMark: 'same-cursor' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(payload)))

    // Act
    const result = await searchArticles('cancer', 'same-cursor')

    // Assert
    expect(result.nextCursorMark).toBeNull()
  })

  it('returns an empty page when the payload has no results', async () => {
    // Arrange
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({})))

    // Act
    const result = await searchArticles('cancer')

    // Assert
    expect(result).toEqual({
      total: 0,
      articles: [],
      nextCursorMark: null,
    })
  })

  it('throws a readable error when the API responds with a failure', async () => {
    // Arrange
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    )

    // Act
    const request = searchArticles('cancer')

    // Assert
    await expect(request).rejects.toThrow(
      'Europe PMC returned 503. Please try again.',
    )
  })
})
