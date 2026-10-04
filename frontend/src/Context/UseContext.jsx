import { createContext, useEffect, useRef, useState } from "react";

const AppContext = createContext();

// 🌐 Centralized Base URL
const BASE_URL = "https://lingolive.onrender.com";

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [allUser, setAllUser] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postPage, setPostPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [usersError, setUsersError] = useState("");
  const postsRequestRef = useRef(false);
  const usersRequestRef = useRef(false);
  const [commentIdForFetching, setCommentIdForFetching] = useState(null);
  const [comments, setComments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friendList, setFriendList] = useState([]);
  const [showImage, setShowImage] = useState("");
  const [showVideo, setShowVideo] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [auth, setAuth] = useState(
    () => localStorage.getItem("auth") === "true"
  );

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        setAuth(false);
        localStorage.setItem("auth", "false");
        setUser(null);
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("auth", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
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

  const fetchPosts = async (page = 1, append = false) => {
    if (postsRequestRef.current || (append && !hasMorePosts)) return false;

    postsRequestRef.current = true;
    setLoadingPosts(true);
    setPostsError("");

    try {
      const response = await fetch(`${BASE_URL}/api/posts?page=${page}&limit=10`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch posts");

      const nextPosts = Array.isArray(data) ? data : data.posts || [];
      const pagination = data.pagination || {};

      setPosts((previousPosts) => {
        if (!append) return nextPosts;
        const existingIds = new Set(previousPosts.map((post) => String(post._id)));
        return [
          ...previousPosts,
          ...nextPosts.filter((post) => !existingIds.has(String(post._id))),
        ];
      });
      setPostPage(pagination.page || page);
      setHasMorePosts(
        pagination.hasMore ?? nextPosts.length === (pagination.limit || 10)
      );
      return true;
    } catch (err) {
      console.error("Error fetching posts:", err.message);
      setPostsError(err.message || "Failed to fetch posts");
      return false;
    } finally {
      postsRequestRef.current = false;
      setLoadingPosts(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/posts/${commentIdForFetching}/comment`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllUser = async (page = 1, append = false) => {
    if (usersRequestRef.current || (append && !hasMoreUsers)) return false;

    usersRequestRef.current = true;
    setLoadingUsers(true);
    setUsersError("");

    try {
      const res = await fetch(`${BASE_URL}/api/auth/AllUser?page=${page}&limit=10`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");

      const nextUsers = data.users || data.data || [];
      const pagination = data.pagination || {};

      setAllUser((previousUsers) => {
        if (!append) return nextUsers;
        const existingIds = new Set(previousUsers.map((userItem) => String(userItem._id)));
        return [
          ...previousUsers,
          ...nextUsers.filter((userItem) => !existingIds.has(String(userItem._id))),
        ];
      });
      setUserPage(pagination.page || page);
      setHasMoreUsers(
        pagination.hasMore ?? nextUsers.length === (pagination.limit || 10)
      );
      return true;
    } catch (err) {
      console.error("Error fetching users:", err.message);
      setUsersError(err.message || "Failed to fetch users");
      return false;
    } finally {
      usersRequestRef.current = false;
      setLoadingUsers(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/friends/requests`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Error fetching friend requests:", err);
    }
  };

  const fetchFriendlist = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/friends/list`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      setFriendList(data.friends || []);
    } catch (err) {
      console.error("Error fetching friend list:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications`, {
        credentials: "include",
      });
      const data = await res.json();
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
    BASE_URL,
    user, setUser,
    allUser, setAllUser,
    requests, setRequests,
    friendList, setFriendList,
    notifications, setNotifications,
    loading, setLoading,
    fetchNotifications,
    posts, setPosts,
    postPage, userPage,
    hasMorePosts, hasMoreUsers,
    loadingPosts, loadingUsers,
    postsError, usersError,
    fetchPosts, fetchUser, fetchAllUser, fetchComments,
    fetchFriendRequests, fetchFriendlist,
    auth, setAuth,
    comments, setComments,
    commentIdForFetching, setCommentIdForFetching,
    showImage, setShowImage,
    showVideo, setShowVideo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;