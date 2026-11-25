import styles from './ResultCard.module.css'

export default function ResultCard({ article }) {
  const meta = [article.journal, article.year].filter(Boolean).join(' · ')

  return (
    <article className={styles.card}>
      <h3 className={styles.title}>
        {article.url ? (
          <a
            className={styles.titleLink}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {article.title}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          article.title
        )}
      </h3>

      {article.authors && <p className={styles.authors}>{article.authors}</p>}
      {meta && <p className={styles.meta}>{meta}</p>}
    </article>
  )
}
