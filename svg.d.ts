declare module "*.svg" {
  import type React from "react";
  const SVGComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export default SVGComponent;
}

declare module "*.svg?url" {
  const content: string;
  export default content;
}

declare module "../images/icons/*.svg" {
  import type React from "react";
  const SVGComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export default SVGComponent;
}
