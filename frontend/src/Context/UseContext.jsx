import { createContext, useEffect, useState } from "react";

const AppContext = createContext();

// Utility function to get API URL
const getApiUrl = () => "https://lingolive.onrender.com";

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [allUser, setAllUser] = useState([]);
  const [posts, setPosts] = useState([]);
  const [commentIdForFetching, setCommentIdForFetching] = useState(null);
  const [comments, setComments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friendList, setFriendList] = useState([]);
  const [showImage, setShowImage] = useState("");
  const [showVideo, setShowVideo] = useState("")

  // notiications
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [auth, setAuth] = useState(
    () => localStorage.getItem("auth") === "true"
  );

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/auth/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        // Token expired or invalid
        setAuth(false);
        localStorage.setItem("auth", "false");
        setUser(null);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("auth", "true");
        localStorage.setItem("user", JSON.stringify(data.user)); // ✅ store user persistently
      }

      setAuth(true);
      localStorage.setItem("auth", "true");
    } catch (err) {
      console.error("Error fetching user:", err.message);
      setAuth(false);
      localStorage.setItem("auth", "false");
      setUser(null);
    }
    setLoading(false);
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/posts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      ("Fetched posts:", data);
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err.message);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `${getApiUrl()}/api/posts/${commentIdForFetching}/comment`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      ("Fetched comments:", data);
      setComments(data);
    } catch (err) {
      (err);
    }
  };

  const fetchAllUser = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/AllUser`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      ("Fetched all users:", data);
      setAllUser(data.data); // assuming your API returns { data: [...] }
    } catch (err) {
      (err);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/friends/requests`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      ("Fetched friend requests:", data);
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Error fetching friend requests:", err);
    }
  };

  const fetchFriendlist = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/friends/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      ("Fetched friend list:", data);
      // You can set this data to a state if needed
      setFriendList(data.friends || []);
    } catch (err) {
      console.error("Error fetching friend list:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/notifications`, {
        credentials: "include",
      });
      const data = await res.json();
      ("Fetched notifications: ", data);
      setNotifications(data.notifications || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUser();
      await Promise.all([
        fetchPosts(),
        fetchAllUser(),
        fetchFriendRequests(),
        fetchFriendlist(),
        fetchNotifications(),
      ]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (commentIdForFetching) {
      fetchComments();
    }
  }, [commentIdForFetching]);

  const value = {
    user,
    setUser,
    allUser,
    setAllUser,
    requests,
    setRequests,
    friendList,
    setFriendList,
    notifications,
    setNotifications,
    loading,
    setLoading,
    fetchNotifications,
    posts,
    setPosts,
    fetchPosts,
    fetchUser,
    fetchAllUser,
    fetchComments,
    fetchFriendRequests,
    fetchFriendlist,
    auth,
    setAuth,
    comments,
    setComments,
    commentIdForFetching,
    setCommentIdForFetching,
    showImage,
    setShowImage,
    showVideo,
    setShowVideo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
