import React from "react";

type Props = React.ComponentProps<"div"> & {
  content: string;
};
export default function HtmlContent({ content = "", ...props }: Props) {
  return <div dangerouslySetInnerHTML={{ __html: content }} {...props} />;
}
