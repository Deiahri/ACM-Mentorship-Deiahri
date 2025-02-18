import React, { Fragment } from "react";
import styles from './ButtonMenu.module.css';

export interface ButtonMenuButtonProperties {
  text?: string;
  onClick?: () => any;
  style?: React.CSSProperties;
}

export default function ButtonMenu({
  buttons,
  style
}: {
  buttons?: ButtonMenuButtonProperties[];
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        backgroundColor: "#222",
        border: "1px solid #fff2",
        borderRadius: 10,
        userSelect: "none",
        overflow: 'hidden',
        ...style
      }}
    >
      {buttons && buttons.map((btn, index) => {
        const { text, onClick, style } = btn;
        return (
          <Fragment key={`btnMenu_${index}`}>
            <ButtonMenuButton text={text} onClick={onClick} style={style}/>
            {index != buttons.length - 1 && (
              <div
                style={{ height: 1, width: "100%", backgroundColor: "#fff1" }}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

function ButtonMenuButton({
  text,
  onClick,
  style,
}: ButtonMenuButtonProperties) {
  return (
    <div
      style={style}
      className={styles.btn}
      onClick={onClick}
    >
      {text}
    </div>
  );
}
