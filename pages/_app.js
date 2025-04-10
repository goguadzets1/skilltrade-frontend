import 'bulma/css/bulma.min.css';
import Navbar from '../components/Navbar';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}
