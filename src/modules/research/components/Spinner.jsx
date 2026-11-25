import loadingIcon from '../../../assets/loading.svg'
import styles from './Spinner.module.css'

/**
 * Decorative loading indicator.
 * It is hidden from assistive technology on purpose: the caller's role="status"
 * region carries the text that screen readers announce.
 */
export default function Spinner() {
  return (
    <img className={styles.spinner} src={loadingIcon} alt="" aria-hidden="true" />
  )
}
