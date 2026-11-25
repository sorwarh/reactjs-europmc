import SearchForm from './components/SearchForm.jsx'
import SearchResults from './components/SearchResults.jsx'
import { useSearch } from './hooks/useSearch.js'
import styles from './ResearchSearchWorkspace.module.css'

export default function ResearchSearchWorkspace() {
  const {
    articles,
    total,
    page,
    hasNext,
    status,
    error,
    search,
    nextPage,
    previousPage,
  } = useSearch()

  return (
    <section className={styles.workspace} aria-label="Research search">
      <h1 className="sr-only">Research Search Workspace</h1>

      <SearchForm onSearch={search} loading={status === 'loading'} />

      <SearchResults
        articles={articles}
        total={total}
        page={page}
        hasNext={hasNext}
        status={status}
        error={error}
        onNext={nextPage}
        onPrevious={previousPage}
      />
    </section>
  )
}
