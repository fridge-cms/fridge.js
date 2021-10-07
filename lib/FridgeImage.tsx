import React from "react";
import formatImageUrl, { ImageFormatOptions } from "./formatImageUrl";

type Props = Omit<React.ComponentProps<"img">, "src"> & {
  format?: ImageFormatOptions;
  src: { url?: string }[];
};

export default function FridgeImage({
  format,
  src: [{ url = "" } = {}] = [{}],
  ...props
}: Props) {
  return url ? (
    <img src={formatImageUrl({ src: url, ...format })} {...props} />
  ) : null;
}
