import useFetch from "use-http";

const useFridge = (
  path: string | null,
  options: {} | any[],
  deps: any[] = []
) => {
  const hookDeps = Array.isArray(options) ? options : deps;

  if (!path) {
    return {
      data: undefined,
      loading: false,
      error: false,
    };
  }

  return useFetch(
    `https://api.fridgecms.com/v2/${(path || "").replace(/^\//, "")}`,
    {
      headers: {
        authorization: process.env.FRIDGE_TOKEN || "",
      },
      ...((Array.isArray(options) ? null : options) || {}),
    },
    hookDeps
  );
};

export default useFridge;
