import { useContext } from "react";
import { PickyWikiContext } from "../contexts/PickyWikiContext";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Loading from "./Loading";
import { Container } from "react-bootstrap";

function SignIn() {
  const { state: { wikipediaApi, auth } } = useContext(PickyWikiContext)
  const [user, loading, error] = useAuthState(auth);

  if (loading) return (
    <>
      <Loading />
    </>
  )

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (user) return (
    <Navigate to="/" />
  )

  return (
    <Container
      style={{
        minHeight: '75vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
      <Button size="lg" onClick={() => (window.location.href = wikipediaApi.getLoginUrl())}>
        Sign In With Wikipedia
      </Button>
    </Container>

  )

}

export default SignIn