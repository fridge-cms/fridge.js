import useSWR from "swr";
import fridge from "./fridge";

const useFridge = (path: string | null, options: {}) => {
  return useSWR(path, fridge, options || {});
};

export default useFridge;
