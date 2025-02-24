import React, { ReactNode } from "react";
import styles from "./FileTab.module.css";
import { useSearchParams } from "react-router-dom";

interface FileTabContainerProps extends React.HTMLProps<HTMLDivElement> {
  tabs: {
    name: string;
    children?: ReactNode;
  }[];
}

const FileTabContainer: React.FC<FileTabContainerProps> = ({
  children,
  tabs,
  ...rest
}) => {
  const [params, setParams] = useSearchParams();
  const tabRaw = params.get('tab');
  const activeTab = isNaN(Number(tabRaw)) ? 0 : Number(tabRaw);
  
  if (activeTab < 0 || activeTab >= tabs.length) {
    return null;
  }

  function setActiveTab(tab: number) {
    setParams({ tab: `${tab}` }, { replace: true });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "start",
        justifyItems: "start",
        alignContent: "start",
        width: '100%'
      }}
      {...rest}
    >
      <div style={{ display: "flex" }}>
        {
          tabs.map((tab, tabIndex) => {
            return <FileFolderTab key={`tab${tabIndex}`} onClick={() => setActiveTab(tabIndex)} name={tab.name} active={tabIndex == activeTab} />
          })
        }
      </div>
      <div
        style={{
          backgroundColor: "#222",
          border: "1px solid #fffa",
          display: "flex",
          alignItems: 'start',
          justifyContent: 'start',
          flexDirection: "row",
          flexWrap: "wrap",
          // gap: "0.5rem",
          padding: "0.5rem",
          width: '100%',
          boxSizing: "border-box",
          zIndex: 1,
          borderRadius: "1rem",
          borderStartStartRadius: 0,
          minHeight: '10rem'
        }}
      >
        {
          tabs[activeTab].children
        }
      </div>
    </div>
  );
};

function FileFolderTab({ name, active, onClick }: { name?: string; active?: boolean, onClick?: () => any }) {
  return (
    <div onClick={onClick} className={`${styles.tab} ${active ? styles["active"] : ""}`}>
      {name}
    </div>
  );
}

export default FileTabContainer;
