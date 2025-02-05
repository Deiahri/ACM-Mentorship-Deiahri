import { useAuth0 } from "@auth0/auth0-react"
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreateClientSocketConnection } from "../features/ClientSocket/ClientSocket";
import HomePage from "../pages/HomePage/HomePage";
import { Outlet, useNavigate } from "react-router-dom";
import { ReduxRootState } from "../store";

export default function App() {
  const { getAccessTokenSilently, isLoading, isAuthenticated } = useAuth0();
  const dispatch = useDispatch();
  const { state } = useSelector((store: ReduxRootState) => store.ClientSocket);
  const navigate = useNavigate();
  
  useEffect(() => {
    async function getToken() {
      console.log('accessToken', await getAccessTokenSilently());
      const userToken = await getAccessTokenSilently();
      CreateClientSocketConnection(userToken, dispatch);
    }
    if (isAuthenticated) {
      getToken();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (state == 'authed_nouser') {
      navigate('./new-user');
    } else if (state == 'authed_user') {
      navigate('./home');
    }
  }, [state]);

  if (isLoading) {
    return <p>Still Loading...</p>
  }

  if (!isAuthenticated) {
    return <p>Not authed</p>
  }


  // console.log(getAccessTokenSilently())
  return <>
    <Outlet/>
  </>
}