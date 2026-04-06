import { Route, Routes } from "react-router-dom";
import ITunesPage from "./pages/ITunesPage/ITunesPage";
import { AlbumPage } from "./pages/AlbumPage/AlbumPage";
import { ROUTES } from "./Routes";

function App() {
  return (
      <Routes>
        <Route path={ROUTES.HOME} index element={<ITunesPage />} />
        <Route path={ROUTES.ALBUMS} element={<ITunesPage />} />
        <Route path={`${ROUTES.ALBUMS}/:id`} element={<AlbumPage />} />
      </Routes>
  );
}

export default App;