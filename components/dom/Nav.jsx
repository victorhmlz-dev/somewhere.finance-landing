import styles from "./Nav.module.css";

const ITEMS = ["Explore", "NFFC", "Collections", "About", "Connect"];

// Navegación mínima (Fase 2: solo estructura/estilo, sin rutas todavía).
export default function Nav() {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <img src="/logo-somewhere-finance.png" alt="somewhere.finance" className={styles.logo} />
      <ul className={styles.links}>
        {ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </nav>
  );
}
