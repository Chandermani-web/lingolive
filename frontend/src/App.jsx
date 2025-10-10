import { lazy, Suspense, useContext } from "react";
import { Route, Routes } from "react-router-dom";
import AppContext from "./Context/UseContext";
import Navbar from "./Components/Common/Navbar";
import NotificationPopupManager from "./Context/NotificationProvider";

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

const App = () => {
  const { auth } = useContext(AppContext);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black min-h-screen text-gray-100">
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <Routes>
          <Route path="/" element={auth ? <Home /> : <Login />} />
          <Route path="/profile" element={auth ? <Profile /> : <Login />} />
          <Route path="/signup" element={auth ? <Home /> : <Signup />} />
          <Route path="/login" element={auth ? <Home /> : <Login />} />
          <Route path="/create-post" element={auth ? <CreatePost /> : <Login />} />
          <Route path="/posts" element={auth ? <ShowPost /> : <Login />} />
          <Route path="/connections" element={auth ? <Connection /> : <Login />} />
          <Route path="/profile/:id" element={auth ? <User_Profile /> : <Login />} />
          <Route path="/notifications" element={auth ? <Notification /> : <Login />} />
          <Route path="/message" element={auth ? <Message /> : <Login />} />
        </Routes>
      </Suspense>
      <NotificationPopupManager />
    </div>
  );
};

export default App;
