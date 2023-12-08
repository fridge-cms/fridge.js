import { useEffect, useState } from "react";
import { mutate } from "swr";
import fridge from "./fridge";

type Props = {
  children: (...args: any) => void;
  query: string | string[];
};

const FridgeContent = ({ children, query }: Props) => {
  const [responses, setResponses] = useState<any[]>([]);
  const queries = Array.isArray(query) ? query : [query];

  useEffect(() => {
    loadContent();
  }, [query]);

  async function loadContent() {
    const responses = await Promise.all(
      queries.map(async (query) => {
        const res = await fridge(query);
        mutate(query, res);
        return res;
      })
    );
    setResponses(responses);
  }

  return responses.length === queries.length ? children(...responses) : null;
};

export default FridgeContent;
