import { lazy, Suspense, useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { Loader } from 'lucide-react';
import AppContext from "./Context/UseContext";
import Navbar from "./Components/Common/Navbar";
import NotificationPopupManager from "./Context/NotificationProvider";
import Loading from "./Loading";
import LandingPage from "./LandingPage";

const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const CreatePost = lazy(() => import("./Components/Post/CreatePost"));
const Connection = lazy(() => import("./pages/Connection"));
const User_Profile = lazy(() => import("./Components/Connections/Page/User_Profile"));
const Notification = lazy(() => import("./pages/Notification"));
const ShowPost = lazy(() => import("./Components/Post/ShowPost"));
const Message = lazy(() => import("./pages/Message"));
const ShowImage = lazy(() => import("./ShowImage"));

const App = () => {
  const { auth, loading } = useContext(AppContext);

    if (loading) <Loading />;

  return (
      <div className="bg-[#050A15] min-h-screen text-gray-100">
        <ShowImage />
        <Navbar />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={auth ? <Home /> : <LandingPage />} />
            <Route path="/profile" element={auth ? <Profile /> : <LandingPage />} />
            <Route path="/signup" element={auth ? <Home /> : <Signup />} />
            <Route path="/login" element={auth ? <Home /> : <Login />} />
            <Route path="/create-post" element={auth ? <CreatePost /> : <LandingPage />} />
            <Route path="/posts" element={auth ? <ShowPost /> : <LandingPage />} />
            <Route path="/connections" element={auth ? <Connection /> : <LandingPage />} />
            <Route path="/profile/:id" element={auth ? <User_Profile /> : <LandingPage />} />
            <Route path="/notifications" element={auth ? <Notification /> : <LandingPage />} />
            <Route path="/message" element={auth ? <Message /> : <LandingPage />} />
          </Routes>
        </Suspense>
        <NotificationPopupManager />
      </div>
  );
};

export default App;
