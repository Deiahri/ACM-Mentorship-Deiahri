import { useEffect, useState } from "react";
import { ObjectAny } from "../../scripts/types";

export default function MinimalisticInput({ value, onChange, style, disabled }: { value?: string, onChange?: (v: string) => any, style?: React.CSSProperties, disabled?: boolean }) {
  const [initialValue, _] = useState(value);

  return (
    <span
      suppressContentEditableWarning={true}
      onInput={(e: ObjectAny) =>
        onChange && onChange(e.target.innerText)
      }
      style={{
        fontSize: "1rem",
        margin: 0,
        borderBottom: "1px solid #fff4",
        textWrap: "wrap",
        minWidth: "10rem",
        ...style
      }}
      contentEditable={!disabled}
    >
      {initialValue}
    </span>
  );
}
