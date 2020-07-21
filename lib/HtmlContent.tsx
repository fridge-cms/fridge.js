import React from "react";

type Props = {
  content: string;
};
export default ({ content = "", ...props }: Props) => (
  <div dangerouslySetInnerHTML={{ __html: content }} {...props} />
);
