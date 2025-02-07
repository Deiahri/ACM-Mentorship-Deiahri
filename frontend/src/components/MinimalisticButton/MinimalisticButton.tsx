import React from "react";
import { AnyFunction } from "../../scripts/types";

export default function MinimalisticButton({ children, onClick, style }: { children?: React.ReactNode, onClick?: AnyFunction, style?: React.CSSProperties }) {
  return (
    <button
      style={{
        border: "2px solid #fff",
        backgroundColor: "transparent",
        color: "white",
        borderRadius: 30,
        padding: 20,
        paddingTop: 8,
        paddingBottom: 8,
        fontSize: "1rem",
        ...style
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
