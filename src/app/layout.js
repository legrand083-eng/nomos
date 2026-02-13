import '../styles/globals.css';

export const metadata = {
  title: 'NOMOΣ — Construction Payment Certificate Management',
  description: 'Plateforme SaaS pour la gestion des certificats de paiement dans le BTP français selon le CCAG 2021',
  keywords: 'BTP, certificat de paiement, CCAG 2021, construction, maître d\'œuvre',
  authors: [{ name: 'POLARIS CONSEIL — Groupe QUESTOR' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0F1C' }
  ],
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('nomos-theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
