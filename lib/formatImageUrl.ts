export type ImageFormatOptions = {
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  h?: number;
  position?:
    | "center"
    | "top"
    | "right top"
    | "right"
    | "right bottom"
    | "bottom"
    | "left bottom"
    | "left"
    | "left top"
    | "north"
    | "northeast"
    | "east"
    | "southeast"
    | "south"
    | "southwest"
    | "west"
    | "northwest"
    | "entropy"
    | "attention";
  w?: number;
};

export default function formatImageUrl({
  src,
  ...options
}: ImageFormatOptions & { src: string }) {
  const query = Object.keys(options)
    .map((key) => `${key}=${options[key as keyof ImageFormatOptions]}`)
    .join("&");
  const separator = src.indexOf("?") === -1 ? "?" : "&";

  return query ? `${src}${separator}${query}` : src;
}
