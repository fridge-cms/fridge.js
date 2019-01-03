export default ({ content = "", ...props }) => (
  <div dangerouslySetInnerHTML={{ __html: content }} {...props} />
);
