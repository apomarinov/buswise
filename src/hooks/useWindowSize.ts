import { useEffect, useState } from "react";

const useWindowSize = () => {
  const [size, setSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const handleResize = () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
};

export default useWindowSize;
