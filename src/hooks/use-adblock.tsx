import { useEffect, useState } from "react";

const useAdblock = (shouldCheckForAdblocker: boolean): boolean => {
  const [isAdBlocked, setIsAdBlocked] = useState<boolean>(false);

  useEffect(() => {
    if (shouldCheckForAdblocker) {
      (async () => {
        const url =
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
        fetch(url, {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
        })
          .then(({ redirected }) => {
            if (redirected) setIsAdBlocked(true);
          })
          .catch((err) => {
            // console.log(err)
            setIsAdBlocked(window.navigator.onLine);
          });
      })();
    }
  }, [shouldCheckForAdblocker]);

  return isAdBlocked;
};

export default useAdblock;
