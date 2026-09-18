export function Hero() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    <header className="hero">
      <img src={`${base}/banner.svg`} alt="react-adblocker-detect" />
      <h1>react-adblocker-detect</h1>
      <p>Detect ad blockers in React and ask visitors to disable them, with a built-in modal.</p>
      <nav className="links">
        <a href="https://www.npmjs.com/package/react-adblocker-detect">npm</a>
        <a href="https://github.com/faraasat/react-adblocker-detect">GitHub</a>
        <a href="https://github.com/faraasat/react-adblocker-detect#readme">Docs</a>
      </nav>
    </header>
  );
}
