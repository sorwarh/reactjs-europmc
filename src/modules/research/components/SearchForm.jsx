import { useId, useState } from 'react'
import styles from './SearchForm.module.css'

const PLACEHOLDER = 'Example: cancer AND immunotherapy NOT melanoma'

export default function SearchForm({ onSearch, loading }) {
  const inputId = useId()
  const errorId = `${inputId}-error`

  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const groupClass = error
    ? `${styles.group} ${styles.groupError}`
    : styles.group

  function handleSubmit(event) {
    event.preventDefault()

    const term = query.trim()
    if (!term) {
      setError('Enter a search term.')
      return
    }

    setError('')
    onSearch(term)
  }

  return (
    <form className={styles.form} role="search" onSubmit={handleSubmit} noValidate>
      <label className="sr-only" htmlFor={inputId}>
        Search Europe PMC
      </label>

      <div className={groupClass}>
        <input
          className={styles.input}
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            if (error) setError('')
          }}
          placeholder={PLACEHOLDER}
          autoComplete="off"
          enterKeyHint="search"
          autoFocus
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {error && (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
