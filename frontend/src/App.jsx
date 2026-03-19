import { lazy, Suspense, useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { Loader } from "lucide-react";
import AppContext from "./Context/UseContext";
import Navbar from "./Components/Common/Navbar";
import NotificationPopupManager from "./Context/NotificationProvider";
import Loading from "./Loading";
import LandingPage from "./LandingPage";
import { useCall } from "./Context/CallContext";
import CallModal from "./Components/Call/CallModal";
import VideoCallUI from "./Components/Call/VideoCallUI";

const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const CreatePost = lazy(() => import("./Components/Post/CreatePost"));
const Connection = lazy(() => import("./pages/Connection"));
const User_Profile = lazy(
  () => import("./Components/Connections/Page/User_Profile"),
);
const Notification = lazy(() => import("./pages/Notification"));
const ShowPost = lazy(() => import("./Components/Post/ShowPost"));
const Message = lazy(() => import("./pages/Message"));
const ShowImage = lazy(() => import("./ShowImage"));

const App = () => {
  const { auth, loading } = useContext(AppContext);
  const { incomingCall, acceptCall, rejectCall, callActive } = useCall();

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary)]">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-[var(--color-accent)] mx-auto mb-4" />
          <p className="text-[var(--color-muted)]">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="bg-[var(--color-primary)] min-h-screen text-[var(--color-text)]">
      <ShowImage />
      <Navbar />
      
      {/* Incoming Call Modal */}
      {incomingCall && !callActive && (
        <CallModal
          incomingCall={incomingCall}
          acceptCall={acceptCall}
          rejectCall={rejectCall}
        />
      )}

      {/* Active Call UI */}
      <VideoCallUI />

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary)]">
            <div className="text-center">
              <Loader className="h-12 w-12 animate-spin text-[var(--color-accent)] mx-auto mb-4" />
              <p className="text-[var(--color-muted)]">Loading...</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={auth ? <Home /> : <Login />} />
          <Route path="/profile" element={auth ? <Profile /> : <Login />} />
          <Route path="/signup" element={auth ? <Home /> : <Signup />} />
          <Route path="/login" element={auth ? <Home /> : <Login />} />
          <Route
            path="/create-post"
            element={auth ? <CreatePost /> : <Login />}
          />
          <Route path="/posts" element={auth ? <ShowPost /> : <Login />} />
          <Route
            path="/connections"
            element={auth ? <Connection /> : <Login />}
          />
          <Route
            path="/profile/:id"
            element={auth ? <User_Profile /> : <Login />}
          />
          <Route
            path="/notifications"
            element={auth ? <Notification /> : <Login />}
          />
          <Route path="/message" element={auth ? <Message /> : <Login />} />
        </Routes>
      </Suspense>
      <NotificationPopupManager />
    </div>
  );
};

export default App;
