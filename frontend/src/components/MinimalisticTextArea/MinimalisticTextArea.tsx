import TextareaAutosize from 'react-textarea-autosize';

export default function MinimalisticTextArea({ onChange, value, disabled, placeholder }: { onChange?: (v: string) => any, value?: string, disabled?: boolean, placeholder?: string }) {
  return (
    <TextareaAutosize
      placeholder={placeholder}
      style={{
        margin: 0,
        fontSize: "1rem",
        padding: 10,
        borderRadius: 10,
        borderStartStartRadius: 0,
        backgroundColor: "#292929",
        minWidth: "30rem",
        // minHeight: "3rem",
        // maxHeight: "40vh",
        marginTop: 5,
        color: 'white',
        border: disabled? undefined : '#fff3'
      }}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      disabled={disabled}
    />
  );
}
