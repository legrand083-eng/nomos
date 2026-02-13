'use client';

import { useState, useEffect } from 'react';
import styles from './BreakingNewsBanner.module.css';

export default function BreakingNewsBanner({ news = [] }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(news && news.length > 0);
  }, [news]);

  if (!visible || !news || news.length === 0) return null;

  const getNewsClass = (type) => {
    switch (type) {
      case 'validation':
      case 'situation_validee':
        return styles.newsValidation;
      case 'alert':
      case 'deviation':
        return styles.newsAlert;
      case 'penalty':
      case 'penalite':
        return styles.newsPenalty;
      case 'info':
      default:
        return styles.newsInfo;
    }
  };

  return (
    <div className={styles.banner}>
      <div className={styles.scrollContainer}>
        <div className={styles.scrollContent}>
          {news.map((item, index) => (
            <span key={index} className={`${styles.newsItem} ${getNewsClass(item.type)}`}>
              {item.title || item.message}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {news.map((item, index) => (
            <span key={`dup-${index}`} className={`${styles.newsItem} ${getNewsClass(item.type)}`}>
              {item.title || item.message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
