import { useRef, useState } from 'react'
import { searchArticles } from '../api/europePmc.js'

/**
 * Runs a search and keeps track of which page is showing.
 *
 * Europe PMC pages with cursor marks rather than page numbers, so we remember
 * the cursor that starts each page we have visited. That makes Previous free
 * (the cursor is already known) and Next possible one page at a time.
 */
export function useSearch() {
  const [articles, setArticles] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const queryRef = useRef('')
  const cursorsRef = useRef(['*']) // cursorsRef.current[i] starts page i + 1

  async function loadPage(targetPage) {
    setStatus('loading')
    setError('')

    try {
      const result = await searchArticles(
        queryRef.current,
        cursorsRef.current[targetPage - 1],
      )

      // Drop any cursors past this page, then remember where the next one starts.
      cursorsRef.current = cursorsRef.current.slice(0, targetPage)
      cursorsRef.current[targetPage] = result.nextCursorMark

      setArticles(result.articles)
      setTotal(result.total)
      setPage(targetPage)
      setHasNext(Boolean(result.nextCursorMark))
      setStatus('success')
    } catch (requestError) {
      setArticles([])
      setTotal(0)
      setStatus('error')
      setError(requestError.message)
    }
  }

  function search(query) {
    queryRef.current = query
    cursorsRef.current = ['*']
    return loadPage(1)
  }

  function nextPage() {
    if (hasNext) return loadPage(page + 1)
  }

  function previousPage() {
    if (page > 1) return loadPage(page - 1)
  }

  return {
    articles,
    total,
    page,
    hasNext,
    status,
    error,
    search,
    nextPage,
    previousPage,
  }
}
