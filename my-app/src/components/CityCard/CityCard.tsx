// import { Button, Col, Row } from 'react-bootstrap';
// import { useLocation } from 'react-router-dom';
// import { getCitiesList } from '../../slices/reagentsSlice';
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch, RootState } from '../../store';
// import {
//   addCityToVacancyApplication,
//   deleteCityFromVacancyApplication,
//   setCities,
// } from '../../slices/methaneApplicationDraftSlice';

// interface Props {
//     city_id?: number;
//     url?: string;
//     city_name?: string;
//     population?: string;
//     salary?: string;
//     unemployment_rate?: string;
//     imageClickHandler: () => void;
//     count?: number;
//     isDraft?: boolean;
// }

// export const CityCard = ({
//     city_id,
//     url,
//     city_name,
//     population,
//     salary,
//     unemployment_rate,
//     imageClickHandler,
//     count,
//     isDraft,
// }: Props) => {
//     const { pathname } = useLocation();
//     const dispatch = useDispatch<AppDispatch>();
//     const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
    
//     const app_id = useSelector(
//         (state: RootState) => state.vacancyApplicationDraft.app_id
//     );

//     const cities = useSelector(
//         (state: RootState) => state.vacancyApplicationDraft.cities
//     );

//     // Обработчик события нажатия на кнопку "Добавить"
//     const handleAdd = async () => {
//         if (city_id) {
//             await dispatch(addCityToVacancyApplication(city_id));
//             await dispatch(getCitiesList()); // Для обновления отображения состояния иконки "корзины" 
//         }
//     }

//     const handleDeleteCity = async () => {
//         if (city_id && app_id) {
//             await dispatch(
//                 deleteCityFromVacancyApplication({
//                 appId: app_id,
//                 cityId: city_id,
//                 })
//             );

//             dispatch(
//                 setCities(cities.filter((city) => city.city_id?.city_id !== city_id))
//             );
//         }
//     };

//     if (pathname.includes('/vacancy_application')) {
//         return (
//         <div className="fav-card">
//             <Row>
//                 <Col xs={2} sm={2} md={2}>
//                 <div className="d-flex justify-center">
//                     <img src={url} alt={city_name} />
//                 </div>
//                 </Col>

//                 <Col xs={10} sm={10} md={10}>
//                 <div className="fav-card-body">
//                     <h5>{city_name}</h5>

//                     <div className="form-group">
//                     <Row>
//                         <Col xs={3} sm={3} md={3}>
//                         <label className="form-label">Количество вакансий:</label>
//                         </Col>
//                         <Col xs={9} sm={9} md={9}>
//                         <input type="number" className="localcount" value={count} disabled />
//                         </Col>
//                     </Row>
//                     </div>

//                     <Row>
//                     <Col md={3} xs={3}>
//                         <a onClick={imageClickHandler} className="fav-btn-open">
//                         Подробнее
//                         </a>
//                     </Col>

//                     <Col md={3} xs={3}>
//                         {(isDraft) && (
//                         <Button className="fav-btn-open" onClick={() => handleDeleteCity()}>
//                             Удалить
//                         </Button>
//                         )}
//                     </Col>
//                     </Row>
//                 </div>
//                 </Col>
//             </Row>
//         </div>
//         );
//     }

//     return (
//         <div className="city-card">
//         <img src={url} alt={city_name} onClick={imageClickHandler} />
//         <h3>{city_name}</h3>
//         <p>Население: {population}</p>
//         <p>Средняя зарплата: {salary}</p>
//         <p>Безработица: {unemployment_rate}</p>

//         {isAuthenticated && (
//             <Button className="city-btn" onClick={handleAdd}>
//             Добавить
//             </Button>
//         )}
//         </div>
//     );
// };