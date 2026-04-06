import "./AlbumPage.css";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { BreadCrumbs } from "../../components/BreadCrumbs/BreadCrumbs";
import { ROUTES, ROUTE_LABELS } from "../../Routes";
import { useParams } from "react-router-dom";
import type { ITunesMusic } from "../../modules/itunesApi";
import { getAlbumById } from "../../modules/itunesApi"; 
import { Col, Row, Spinner, Image } from "react-bootstrap";
import defaultImage from "../../assets/DefaultImage.jpg";

import { SONGS_MOCK } from "../../modules/mock";

export const AlbumPage: FC = () => {
  const [pageData, setPageDdata] = useState<ITunesMusic>();

  const { id } = useParams(); // ид страницы, пример: "/albums/12"

  useEffect(() => {
    if (!id) return;
    getAlbumById(id)
      .then((response) => setPageDdata(response.results[0]))
      .catch(
        () =>
          setPageDdata(
            SONGS_MOCK.results.find(
              (album) => String(album.collectionId) == id
            )
          ) /* В случае ошибки используем мок данные, фильтруем по ид */
      );
  }, [id]);

  return (
    <div>
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.ALBUMS, path: ROUTES.ALBUMS },
          { label: pageData?.collectionCensoredName || "Альбом" },
        ]}
      />
      {pageData ? ( // проверка на наличие данных, иначе загрузка
        <div className="container">
          <Row>
            <Col md={6}>
              <p>
                Альбом: <strong>{pageData.collectionCensoredName}</strong>
              </p>
              <p>
                Исполнитель: <strong>{pageData.artistName}</strong>
              </p>
            </Col>
            <Col md={6}>
              <Image
                src={pageData.artworkUrl100 || defaultImage} // дефолтное изображение, если нет artworkUrl100
                alt="Картинка"
                width={100}
              />
            </Col>
          </Row>
        </div>
      ) : (
        <div className="album_page_loader_block">{/* загрузка */}
          <Spinner animation="border" />
        </div>
      )}
    </div>
  );
};