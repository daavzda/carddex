import './globals.css';

export const metadata = {
  title: 'CardDex — sua coleção Yu-Gi-Oh!',
  description: 'Organize e acompanhe sua coleção de cartas Yu-Gi-Oh!'
};

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
