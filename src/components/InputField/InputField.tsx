import { FC } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from '../../Routes';
import { AppDispatch, RootState } from '../../store';
import { getReagentsList, setSearchValue } from '../../slices/reagentsSlice';

interface Props {
  value: string;
  loading?: boolean;
}

const InputField: FC<Props> = ({ value, loading }) => {
  const dispatch = useDispatch<AppDispatch>();
  const app_id = useSelector((state: RootState) => state.methaneApplicationDraft.app_id);
  const count = useSelector((state: RootState) => state.methaneApplicationDraft.count);
  const navigate = useNavigate();

  const hasDraftItems = Boolean(app_id) && count > 0;

  const handleClick = () => {
    if (!hasDraftItems) return;
    navigate(`${ROUTES.METHANE_APPLICATION}/${app_id}`);
  };

  return (
    <div className="search-bar">
      <Row>
        <Col xs={7} sm={7} md={7}>
          <div className="search-input">
            <input
              type="text"
              placeholder="Поиск"
              value={value}
              onChange={(event) => dispatch(setSearchValue(event.target.value))}
              className="inp-text"
            />
          </div>
        </Col>

        <Col xs={3} sm={3} md={3}>
          <Button
            disabled={loading}
            className="search-button"
            onClick={() => dispatch(getReagentsList())}
          >
            Найти
          </Button>
        </Col>

        <Col xs={2} sm={2} md={2}>
          <Button
            className="btn-favorites"
            onClick={handleClick}
            disabled={!hasDraftItems}
            title={!hasDraftItems ? 'Корзина пуста' : 'Открыть заявку'}
          >
            {hasDraftItems && (
              <span className="badge rounded-pill position-absolute">
                {count}
              </span>
            )}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default InputField;