import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <a className={styles.skipLink} href="#main">
        Skip to search
      </a>

      <div className={styles.bar}>
        <a className={styles.brand} href="/">
          <img
            className={styles.logo}
            src="https://europepmc.org/template/images/epmc-logo-single.svg"
            width="220"
            height="48"
            alt="Europe PMC"
          />
          <span className={styles.brandName}>Research Search Workspace</span>
        </a>
      </div>
    </header>
  )
}
