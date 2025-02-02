import { useAuth0 } from "@auth0/auth0-react"
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { CreateClientSocketConnection } from "../features/ClientSocket/ClientSocket";

export default function App() {
  const { getAccessTokenSilently, isLoading, isAuthenticated } = useAuth0();
  const dispatch = useDispatch();
  
  useEffect(() => {
    async function getToken() {
      console.log('accessToken', await getAccessTokenSilently());
      const userToken = await getAccessTokenSilently();
      CreateClientSocketConnection(userToken);
    }
    if (isAuthenticated) {
      getToken();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <p>Still Loading...</p>
  }

  if (!isAuthenticated) {
    return <p>Not authed</p>
  }


  // console.log(getAccessTokenSilently())
  return <p>App...</p>
}