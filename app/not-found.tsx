import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <span className="not-found-code">ERROR 404 / OUTSIDE THE INDEX</span>
      <h1>Lost in<br /><em>the dark.</em></h1>
      <p>This page has slipped beyond the archive. The rest of the world is still where you left it.</p>
      <a href="/">RETURN TO THE BEGINNING <ArrowUpRight size={15} aria-hidden="true" /></a>
    </main>
  );
}
