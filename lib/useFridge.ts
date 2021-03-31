import useFetch from "use-http";

const useFridge = (
  path: string | null,
  options: {} | any[],
  deps: any[] = []
) => {
  const hookDeps = Array.isArray(options) ? options : deps;
  const apiPath = path
    ? `https://api.fridgecms.com/v2/${(path || "").replace(/^\//, "")}`
    : undefined;

  const hookReturn = useFetch(
    apiPath,
    {
      headers: {
        authorization: process.env.FRIDGE_TOKEN || "",
      },
      ...((Array.isArray(options) ? null : options) || {}),
    },
    hookDeps
  );

  return hookReturn;
};

export default useFridge;
