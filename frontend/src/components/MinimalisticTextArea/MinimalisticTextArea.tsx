export default function MinimalisticTextArea({ style, onChange, value, disabled, placeholder }: { style?: React.CSSProperties, onChange?: (v: string) => any, value?: string, disabled?: boolean, placeholder?: string }) {
  return (
    <textarea
      placeholder={placeholder}
      style={{
        margin: 0,
        fontSize: "1rem",
        padding: 10,
        borderRadius: 10,
        borderStartStartRadius: 0,
        backgroundColor: "transparent",
        minWidth: "10rem",
        minHeight: "3rem",
        maxWidth: "80%",
        maxHeight: "40vh",
        marginTop: 5,
        height: "4rem",
        width: "28rem",
        color: 'white',
        border: disabled? undefined : '#fff3',
        ...style
      }}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      disabled={disabled}
    />
  );
}
