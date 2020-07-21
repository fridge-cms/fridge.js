import Fridge from "fridge";

const fridge = async (path: string, options: FridgeGetOptions = {}) => {
  const { token = process.env.FRIDGE_TOKEN, ...getOptions } = options || {};
  const client = new Fridge({ token });

  const res = await client.get(path, getOptions);

  if (res.error) {
    throw new Error(
      `Fridge Error: ${path}: ${res.error.code} - ${res.error.message}`
    );
  }

  return res;
};

export default fridge;
