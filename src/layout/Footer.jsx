import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <p className={styles.legal}>
        <a
          className={styles.link}
          href="https://europepmc.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Europe PMC
        </a>
        . &copy; {year} Research Search Workspace.
      </p>
    </footer>
  )
}
