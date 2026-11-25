import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResearchSearchWorkspace from './ResearchSearchWorkspace.jsx'

function articleResponse(
  articles,
  { total = articles.length, nextCursorMark = null } = {},
) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      hitCount: total,
      nextCursorMark,
      resultList: { result: articles },
    }),
  }
}

function apiArticle(overrides = {}) {
  return {
    source: 'MED',
    id: '123',
    title: 'Cancer immunotherapy review',
    authorString: 'Smith J',
    journalTitle: 'Test Journal',
    pubYear: '2024',
    pmcid: 'PMC123',
    ...overrides,
  }
}

function stubFetch(...responses) {
  const fetchMock = vi.fn()

  for (const response of responses) {
    fetchMock.mockResolvedValueOnce(response)
  }

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderWorkspace() {
  render(<ResearchSearchWorkspace />)
  return userEvent.setup()
}

async function submitSearch(user, query) {
  const input = screen.getByRole('searchbox', { name: 'Search Europe PMC' })
  await user.type(input, query)
  await user.click(screen.getByRole('button', { name: 'Search' }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ResearchSearchWorkspace', () => {
  it('shows the idle prompt before a search', () => {
    // Arrange
    render(<ResearchSearchWorkspace />)

    // Act
    const prompt = screen.getByText('Enter a search term to see results.')

    // Assert
    expect(prompt).toBeInTheDocument()
  })

  it('rejects an empty search without calling the API', async () => {
    // Arrange
    const fetchMock = stubFetch()
    const user = renderWorkspace()

    // Act
    await user.click(screen.getByRole('button', { name: 'Search' }))

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a search term.',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('trims the query before sending it', async () => {
    // Arrange
    const fetchMock = stubFetch(articleResponse([apiArticle()]))
    const user = renderWorkspace()

    // Act
    await submitSearch(user, '  cancer AND immunotherapy  ')
    await screen.findByRole('heading', {
      name: /cancer immunotherapy review/i,
    })

    // Assert
    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.searchParams.get('query')).toBe('cancer AND immunotherapy')
  })

  it('renders the details of a matching article', async () => {
    // Arrange
    stubFetch(articleResponse([apiArticle()]))
    const user = renderWorkspace()

    // Act
    await submitSearch(user, 'cancer')

    // Assert
    expect(
      await screen.findByRole('heading', {
        name: /cancer immunotherapy review/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Smith J')).toBeInTheDocument()
    expect(screen.getByText('Test Journal · 2024')).toBeInTheDocument()
  })

  it('shows the empty state when nothing matches', async () => {
    // Arrange
    stubFetch(articleResponse([], { total: 0 }))
    const user = renderWorkspace()

    // Act
    await submitSearch(user, 'nothing matches this')

    // Assert
    expect(await screen.findByText('No results found.')).toBeInTheDocument()
    expect(
      screen.getByText('Try a broader search or check the spelling.'),
    ).toBeInTheDocument()
  })

  it('shows the API error in an alert', async () => {
    // Arrange
    stubFetch({ ok: false, status: 503 })
    const user = renderWorkspace()

    // Act
    await submitSearch(user, 'cancer')

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Europe PMC returned 503. Please try again.',
    )
  })

  it('requests the next cursor when Next is clicked', async () => {
    // Arrange
    const fetchMock = stubFetch(
      articleResponse([apiArticle({ id: '1', title: 'First article' })], {
        total: 2,
        nextCursorMark: 'cursor-2',
      }),
      articleResponse([apiArticle({ id: '2', title: 'Second article' })], {
        total: 2,
      }),
    )
    const user = renderWorkspace()
    await submitSearch(user, 'cancer')
    await screen.findByRole('heading', { name: /first article/i })

    // Act
    await user.click(screen.getByRole('button', { name: 'Next' }))

    // Assert
    expect(
      await screen.findByRole('heading', { name: /second article/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Page 2')).toBeInTheDocument()
    expect(
      new URL(fetchMock.mock.calls[1][0]).searchParams.get('cursorMark'),
    ).toBe('cursor-2')
  })

  it('returns to the first page when Previous is clicked', async () => {
    // Arrange
    const fetchMock = stubFetch(
      articleResponse([apiArticle({ id: '1', title: 'First article' })], {
        total: 2,
        nextCursorMark: 'cursor-2',
      }),
      articleResponse([apiArticle({ id: '2', title: 'Second article' })], {
        total: 2,
      }),
      articleResponse([apiArticle({ id: '1', title: 'First article' })], {
        total: 2,
        nextCursorMark: 'cursor-2',
      }),
    )
    const user = renderWorkspace()
    await submitSearch(user, 'cancer')
    await screen.findByRole('heading', { name: /first article/i })
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await screen.findByRole('heading', { name: /second article/i })

    // Act
    await user.click(screen.getByRole('button', { name: 'Previous' }))

    // Assert
    expect(
      await screen.findByRole('heading', { name: /first article/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Page 1')).toBeInTheDocument()
    expect(
      new URL(fetchMock.mock.calls[2][0]).searchParams.get('cursorMark'),
    ).toBe('*')
  })
})
