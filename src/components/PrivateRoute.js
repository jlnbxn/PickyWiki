import { useContext } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Route, Navigate } from 'react-router-dom';
import { PickyWikiContext } from '../contexts/PickyWikiContext';
import Loading from './Loading';

const PrivateRoute = ({ component: Component, path, ...rest }) => {
    const { state: { auth, customAuthLoading, isUpdating } } = useContext(PickyWikiContext)
    const [user, loading, error] = useAuthState(auth);
    var ref = document.referrer;
    //  && 

    if ((loading || customAuthLoading || isUpdating) && ref.match(/^https?:\/\/([^\/]+\.)?wikipedia\.org(\/|$)/i)) {
        return (
            <Loading />
        );
    }
    if (error) {
        return (
            <div>
                <p>Error: {error}</p>
            </div>
        );
    }
    if (user) {
        return (
            <Route {...rest} render={props => (
                <Component {...props} />
            )} />
        );
    }
    return (
        <Navigate to="/signin" />
    )
};

export default PrivateRoute;