import { AdblockDetector } from "react-adblocker-detect";

export default function Home() {
  return (
    <section>
      <h1>Non Persistent Adblocker</h1>
      <AdblockDetector />
    </section>
  );
}
