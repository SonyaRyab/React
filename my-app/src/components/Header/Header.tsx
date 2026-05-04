import { Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { ROUTES } from '../../Routes';
import { AppDispatch, RootState } from '../../store';
import { logoutUserAsync } from '../../slices/userSlice';
import { clearSearchValue, getReagentsList } from '../../slices/reagentsSlice';
import { resetDraft } from '../../slices/methaneApplicationDraftSlice';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const isAuthenticated = useSelector(
        (state: RootState) => state.user.isAuthenticated
    );
    const username = useSelector((state: RootState) => state.user.username);
    const draftCount = useSelector(
        (state: RootState) => state.methaneApplicationDraft.count
    );

    const handleExit = async () => {
        await dispatch(logoutUserAsync());
        dispatch(clearSearchValue());
        dispatch(resetDraft());
        navigate(ROUTES.REAGENTS);
        await dispatch(getReagentsList());
    };

    return (
        <header className="header">
            <div className="header-left">
                <Link to={ROUTES.REAGENTS}>Реагенты</Link>
            </div>

            <div className="header-right">
                <Link to={ROUTES.METHANE_APPLICATION}>Заявка{draftCount > 0 ? ` (${draftCount})` : ''}</Link>
                {isAuthenticated && <span>{username}</span>}

                {(isAuthenticated == false ) && (
                    <Link to={ROUTES.LOGIN}>
                        <Button className="login-btn">Войти</Button>
                    </Link>
                )}

                {(isAuthenticated == true) && (
                    <Button variant="primary" type="submit" className="login-btn" onClick={ handleExit }>
                        Выйти
                    </Button>
                )}
            </div>
        </header>
    );
};

export default Header;