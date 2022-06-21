import { FC, useMemo } from "react";
import { Link } from "react-router-dom";

type Props = {
  href: string
  self?: boolean;
  disabled?: boolean;
};

const Anchor: FC<Props> = ({ children, href, self, disabled }) => {
  const props = useMemo(() => {
    if (self === true) return {};
    return {
      target: "_blank",
      rel: "noopener noreferrer",
    };
  }, [self]);
  if (disabled) return <span style={{ textDecoration: "underline", cursor: "not-allowed" }}>{children}</span>
  if (href.startsWith("http")) return <a href={href} {...props}>{children}</a>;
  return <span className="bh-anchor"><Link to={href}>{children}</Link></span>
};

export default Anchor;