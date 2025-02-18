import { createContext, ReactNode, useState } from "react";
import { ClientSocketUser } from "../../features/ClientSocket/ClientSocket";

type UserPageContextType = {
  user?: ClientSocketUser|undefined,
  setUser: (v: ClientSocketUser|undefined) => void
  changed: boolean,
  setChanged: (v: boolean) => void,
  saving: boolean,
  setSaving: (v: boolean) => void
};

export const UserPageContext = createContext<UserPageContextType>({
  setUser: (_) => {},
  changed: false,
  setChanged: (_) => {},
  saving: false,
  setSaving: (_) => {},
});

export const UserPageContextProvider = ({ children }: { children?: ReactNode }) => {
  const [userPageUser, setUserPageUser] = useState<ClientSocketUser|undefined>(undefined);
  const [changed, setChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  return (
    <UserPageContext.Provider value={{ user: userPageUser, setUser: setUserPageUser, changed, setChanged, saving, setSaving }}>
      {children}
    </UserPageContext.Provider>
  )
}
