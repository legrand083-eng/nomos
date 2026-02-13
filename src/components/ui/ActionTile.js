import Link from 'next/link';
import styles from './ActionTile.module.css';

export default function ActionTile({ color = 'blue', title, description, link, icon }) {
  const Wrapper = link ? Link : 'div';
  const wrapperProps = link ? { href: link } : {};

  return (
    <Wrapper {...wrapperProps} className={`${styles.tile} ${styles[color]}`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {link && (
        <div className={styles.arrow}>→</div>
      )}
    </Wrapper>
  );
}
