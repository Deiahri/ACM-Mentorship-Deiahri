import React from "react";
import { AnyFunction } from "../../scripts/types";

export default function MinimalisticButton({ children, onClick, style, disabled }: { children?: React.ReactNode, onClick?: AnyFunction, style?: React.CSSProperties, disabled?: boolean }) {
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
        opacity: disabled ? 0.5 : 1,
        ...style
      }}
      disabled={disabled}
      onClick={() => !disabled && (onClick&&onClick())}
    >
      {children}
    </button>
  );
}
