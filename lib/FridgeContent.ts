import useFetch from "use-http";
import { useEffect, useState } from "react";

type Props = {
  children: (...args: any) => void;
  query: string | string[];
};

const FridgeContent = ({ children, query }: Props) => {
  const [responses, setResponses] = useState<any[]>([]);
  const queries = Array.isArray(query) ? query : [query];
  const { get } = useFetch("https://api.fridgecms.com/v2", {
    headers: {
      authorization: process.env.FRIDGE_TOKEN || "",
    },
  });

  useEffect(() => {
    loadContent();
  }, [query]);

  async function loadContent() {
    const responses = await Promise.all(queries.map((query) => get(query)));
    setResponses(responses);
  }

  return responses.length === queries.length ? children(...responses) : null;
};

export default FridgeContent;
