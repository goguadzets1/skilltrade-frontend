import Link from 'next/link';

export default function Home() {
  return (
    <section className="section has-text-centered">
      <div className="container">
        <h1 className="title">Welcome to SkillTrade</h1>
        <p className="subtitle">Swap skills. Learn together. Grow your community.</p>
        <Link href="/login" className="button is-link is-large mt-4">
          Get Started
        </Link>
      </div>
    </section>
  );
}
