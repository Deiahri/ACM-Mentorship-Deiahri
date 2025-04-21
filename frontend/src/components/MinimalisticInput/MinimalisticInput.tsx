import { ObjectAny } from "../../scripts/types";
import AutowidthInput from "react-autowidth-input";

export default function MinimalisticInput({
  value,
  onChange,
  style,
  disabled,
  placeholder
}: {
  value?: string;
  onChange?: (v: string) => any;
  style?: React.CSSProperties;
  disabled?: boolean;
  placeholder?: string
}) {
  return (
    <AutowidthInput
      onChange={(e: ObjectAny) => onChange && onChange(e.target.value)}
      style={{
        fontSize: "1rem",
        padding: '0.3rem',
        borderRadius: '0.3rem',
        margin: 0,
        backgroundColor: disabled ? "transparent" : "#333",
        textWrap: "wrap",
        cursor: 'text',
        userSelect: 'all',
        ...style,
      }}
      placeholder={placeholder}
      disabled={disabled}
      value={value||' '}
      extraWidth={4}
      minWidth={'2rem'}
      placeholderIsMinWidth={true}
    />
  );
}
