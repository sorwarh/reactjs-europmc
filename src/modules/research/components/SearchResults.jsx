import { PAGE_SIZE } from '../api/europePmc.js'
import ResultCard from './ResultCard.jsx'
import Spinner from './Spinner.jsx'
import styles from './SearchResults.module.css'

function summaryFor(status, articles, total, page) {
  if (status === 'loading') return 'Searching Europe PMC…'
  if (articles.length === 0) return 'No results found.'

  const from = (page - 1) * PAGE_SIZE + 1
  const to = from + articles.length - 1

  return `${total.toLocaleString()} results · showing ${from.toLocaleString()}–${to.toLocaleString()}`
}

export default function SearchResults({
  articles,
  total,
  page,
  hasNext,
  status,
  error,
  onNext,
  onPrevious,
}) {
  if (status === 'idle') {
    return (
      <p className={styles.message}>
        Enter a search term to see results.
      </p>
    )
  }

  const loading = status === 'loading'
  const failed = status === 'error'

  return (
    <section className={styles.results} aria-labelledby="results-heading">
      <h2 className={styles.heading} id="results-heading">
        Results
      </h2>

      {failed ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        <div
          className={styles.status}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {loading && <Spinner />}
          <p className={styles.summary}>
            {summaryFor(status, articles, total, page)}
          </p>
        </div>
      )}

      {!failed && !loading && articles.length === 0 && (
        <p className={styles.hint}>
          Try a broader search or check the spelling.
        </p>
      )}

      {!failed && articles.length > 0 && (
        <ol className={styles.list} aria-busy={loading}>
          {articles.map((article) => (
            <li key={article.id}>
              <ResultCard article={article} />
            </li>
          ))}
        </ol>
      )}

      {!failed && (
        <nav className={styles.pagination} aria-label="Results pages">
          <button
            className={styles.pageButton}
            type="button"
            onClick={onPrevious}
            disabled={loading || page === 1}
          >
            Previous
          </button>
          <span className={styles.pageIndicator}>Page {page}</span>
          <button
            className={styles.pageButton}
            type="button"
            onClick={onNext}
            disabled={loading || !hasNext}
          >
            Next
          </button>
        </nav>
      )}
    </section>
  )
}
