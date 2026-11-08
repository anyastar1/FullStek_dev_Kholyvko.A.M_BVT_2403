import type { ReactElement } from "react";
import { Fade } from "@mui/material";

interface RevealProps {
  index?: number;
  children: ReactElement;
}

export function Reveal({ index = 0, children }: RevealProps) {
  return (
    <Fade in appear timeout={400} style={{ transitionDelay: `${Math.min(index, 8) * 70}ms` }}>
      {children}
    </Fade>
  );
}
