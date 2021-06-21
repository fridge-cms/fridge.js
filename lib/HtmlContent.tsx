import React from "react";

type Props = React.ComponentProps<"div"> & {
  content: string;
};
export default ({ content = "", ...props }: Props) => (
  <div dangerouslySetInnerHTML={{ __html: content }} {...props} />
);
