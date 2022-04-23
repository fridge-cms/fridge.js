import Fridge from "fridge";

const createPublicContent = async (
  contentType: string,
  body: {},
  options?: { token?: string }
) => {
  const defaultToken =
    process.env.FRIDGE_TOKEN || process.env.NEXT_PUBLIC_FRIDGE_TOKEN;
  const { token = defaultToken } = options || {};
  const client = new Fridge({ token });

  const res = await client.post(`public/${contentType}`, body);

  if (res.error) {
    throw new Error(
      `Fridge Error: createPublicContent(${contentType}): ${res.error.code} - ${res.error.message}`
    );
  }

  return res;
};

export default createPublicContent;
