import React from "react";
import FileTab from "./FileTab";

interface FileTabContainerProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactElement<React.ComponentProps<typeof FileTab>>[];  // Array of FileTab elements
}


const FileTabContainer: React.FC<FileTabContainerProps> = ({ children, ...rest }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "start",
        justifyItems: "start",
        alignContent: "start",
      }}
      {...rest}
    >
      <div style={{ display: "flex" }}>
        <div
          style={{
            padding: "1rem",
            fontSize: "1.2rem",
            fontWeight: 700,
            paddingLeft: "1.75rem",
            paddingRight: "1.75rem",
            borderRadius: "0.5rem",
            borderEndEndRadius: 0,
            borderEndStartRadius: 0,
            border: "1px solid #fffa",
            borderBottom: "transparent",
            marginBottom: -2,
            zIndex: 2,
            backgroundColor: "#222",
          }}
        >
          To Do
        </div>
        <div
          style={{
            padding: "1rem",
            fontSize: "1.2rem",
            fontWeight: 700,
            paddingLeft: "1.75rem",
            paddingRight: "1.75rem",
            borderRadius: "0.5rem",
            borderEndEndRadius: 0,
            borderEndStartRadius: 0,
            border: "1px solid #fffa",
            marginBottom: -1,
            zIndex: 0,
            backgroundColor: "#191919",
            transform: "translate(5%, 20%)",
          }}
        >
          Goals
        </div>
      </div>
      <div
        style={{
          backgroundColor: "#222",
          border: "1px solid #fffa",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          // gap: "0.5rem",
          padding: "0.5rem",
          width: "100%",
          boxSizing: "border-box",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}


export default FileTabContainer;