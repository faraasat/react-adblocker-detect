import { AdblockDetector } from "react-adblocker-detect";

export default function Home() {
  return (
    <section>
      <h1>Persistent Adblocker</h1>
      <AdblockDetector config={{ persistent: true, pollingTime: 600 }} />
    </section>
  );
}
