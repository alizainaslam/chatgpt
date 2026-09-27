import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";
import { socket } from "../lib/socket";
import {
  createConversation,
  fetchConversations,
} from "../store/conversationsSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type ChatHistoryResponse = {
  chatId: string;
  messages: {
    _id: string;
    content: string;
    role: "user" | "model" | "assistant";
  }[];
};

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatError, setChatError] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const activeConversationIdRef = useRef<string | null>(null);
  const dispatch = useAppDispatch();
  const { items: conversations, status, error } = useAppSelector(
    (state) => state.conversations,
  );

  const activeConversation = conversations.find(
    (conversation) => conversation._id === activeConversationId,
  );

  useEffect(() => {
    void dispatch(fetchConversations());

    const handleConnect = () => {
      const chatId = activeConversationIdRef.current;
      if (chatId) {
        socket.emit("get-chat-history", { chatId });
      }
    };
    const handleResponse = (response: { chatId: string; content: string }) => {
      if (response.chatId !== activeConversationIdRef.current) return;
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-${Math.random()}`,
          role: "assistant",
          text: response.content,
        },
      ]);
      setChatError("");
    };
    const handleChatHistory = (response: ChatHistoryResponse) => {
      if (response.chatId !== activeConversationIdRef.current) return;
      setMessages(
        response.messages.map((message) => ({
          id: message._id,
          role: message.role === "user" ? "user" : "assistant",
          text: message.content,
        })),
      );
      setIsLoadingHistory(false);
      setChatError("");
    };
    const handleChatHistoryError = (response: {
      chatId: string;
      message: string;
    }) => {
      if (response.chatId !== activeConversationIdRef.current) return;
      setIsLoadingHistory(false);
      setChatError(response.message);
    };
    const handleError = (message: string) => setChatError(message);
    const handleConnectError = (event: Error) => {
      setIsLoadingHistory(false);
      setChatError(event.message || "Unable to connect to chat.");
    };

    socket.on("connect", handleConnect);
    socket.on("ai-response", handleResponse);
    socket.on("chat-history", handleChatHistory);
    socket.on("chat-history-error", handleChatHistoryError);
    socket.on("ai-error", handleError);
    socket.on("connect_error", handleConnectError);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("ai-response", handleResponse);
      socket.off("chat-history", handleChatHistory);
      socket.off("chat-history-error", handleChatHistoryError);
      socket.off("ai-error", handleError);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, [dispatch]);

  const startNewChat = () => {
    activeConversationIdRef.current = null;
    setActiveConversationId(null);
    setDraft("");
    setMessages([]);
    setChatError("");
    setIsLoadingHistory(false);
    setSidebarOpen(false);
  };

  const openConversation = (conversationId: string) => {
    activeConversationIdRef.current = conversationId;
    setActiveConversationId(conversationId);
    setMessages([]);
    setChatError("");
    setIsLoadingHistory(true);
    if (socket.connected) {
      socket.emit("get-chat-history", { chatId: conversationId });
    }
    setSidebarOpen(false);
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isSending || isLoadingHistory) return;
    if (!socket.connected) {
      setChatError("Chat is still connecting. Please try again in a moment.");
      return;
    }

    setIsSending(true);
    setChatError("");
    try {
      const conversationId =
        activeConversationId ??
        (await dispatch(createConversation(text)).unwrap())._id;

      activeConversationIdRef.current = conversationId;
      setActiveConversationId(conversationId);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-${Math.random()}`,
          role: "user",
          text,
        },
      ]);
      socket.emit("ai-message", { chatId: conversationId, content: text });
      setDraft("");
    } catch (requestError) {
      setChatError(
        typeof requestError === "string"
          ? requestError
          : "Unable to send your message. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <main className="chat-app">
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="chat-sidebar__scrim"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}

      <aside
        aria-label="Chat navigation"
        className={`chat-sidebar${sidebarOpen ? " chat-sidebar--open" : ""}`}
      >
        <div className="chat-sidebar__top">
          <Link
            className="chat-brand"
            to="/"
            aria-label="Luma home"
            onClick={startNewChat}
          >
            <span className="chat-brand__mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 3.5 19.5 12.5 28.5 16 19.5 19.5 16 28.5 12.5 19.5 3.5 16 12.5 12.5 16 3.5Z"
                  fill="currentColor"
                />
                <circle cx="25.5" cy="6.5" r="2.5" fill="currentColor" />
              </svg>
            </span>
            <span>Luma</span>
          </Link>
          <button
            aria-label="Close navigation"
            className="chat-icon-button chat-sidebar__close"
            onClick={() => setSidebarOpen(false)}
            type="button"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <button
          className="chat-new-button"
          onClick={startNewChat}
          type="button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>New chat</span>
          <span className="chat-new-button__shortcut">⌘ K</span>
        </button>

        <nav aria-label="Recent chats" className="chat-history">
          <h2 className="chat-sidebar__section-title">Recent</h2>
          <ul className="chat-history__list">
            {conversations.map((conversation) => (
              <li key={conversation._id}>
                <button
                  aria-current={
                    activeConversationId === conversation._id
                      ? "page"
                      : undefined
                  }
                  className={`chat-history__item${
                    activeConversationId === conversation._id
                      ? " chat-history__item--active"
                      : ""
                  }`}
                  onClick={() => openConversation(conversation._id)}
                  type="button"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.8-3.1A7.5 7.5 0 1 1 20 11.5Z" />
                  </svg>
                  <span>{conversation.title}</span>
                </button>
              </li>
            ))}
          </ul>
          {status === "loading" && (
            <p className="chat-history__status">Loading conversations...</p>
          )}
          {status === "failed" && (
            <div className="chat-history__status" role="alert">
              <span>{error}</span>
              <button
                onClick={() => void dispatch(fetchConversations())}
                type="button"
              >
                Try again
              </button>
            </div>
          )}
        </nav>

        <div className="chat-sidebar__bottom">
          <button className="chat-upgrade" type="button">
            <span className="chat-upgrade__icon" aria-hidden="true">
              ✦
            </span>
            <span className="chat-upgrade__copy">
              <strong>Make more with Luma</strong>
              <span>Explore plans and features</span>
            </span>
            <span className="chat-upgrade__arrow" aria-hidden="true">
              →
            </span>
          </button>
          <button className="chat-profile" type="button">
            <span className="chat-profile__avatar">A</span>
            <span className="chat-profile__details">
              <strong>Alex Morgan</strong>
              <span>Free plan</span>
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="5" cy="12" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </aside>

      <section aria-label="Chat" className="chat-main">
        <header className="chat-topbar">
          <button
            aria-label="Open navigation"
            className="chat-icon-button chat-menu-button"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <button
            aria-label="Select model"
            className="chat-model"
            type="button"
          >
            <span>Luma</span>
            <span className="chat-model__badge">Standard</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m7 10 5 5 5-5" />
            </svg>
          </button>
          <button className="chat-share" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 15V3m0 0L8 7m4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
            </svg>
            <span>Share</span>
          </button>
        </header>

        <div className="chat-content">
          {isLoadingHistory ? (
            <section aria-live="polite" className="chat-empty">
              <p className="chat-empty__description">
                Loading conversation...
              </p>
            </section>
          ) : messages.length > 0 ? (
            <div aria-live="polite" className="chat-messages">
              <h1 className="chat-messages__title">
                {activeConversation?.title}
              </h1>
              {messages.map((message) => (
                <article
                  className={`chat-message${
                    message.role === "user" ? " chat-message--user" : ""
                  }`}
                  key={message.id}
                >
                  <span
                    aria-hidden="true"
                    className={
                      message.role === "user"
                        ? "chat-message__avatar--user"
                        : "chat-message__avatar"
                    }
                  >
                    {message.role === "user" ? "A" : "✦"}
                  </span>
                  <div className="chat-message__body">
                    <h2 className="chat-message__name">
                      {message.role === "user" ? "You" : "Luma"}
                    </h2>
                    <p className="chat-message__text">{message.text}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <section aria-labelledby="welcome-title" className="chat-empty">
              <span aria-hidden="true" className="chat-empty__mark">
                <svg viewBox="0 0 32 32" fill="none">
                  <path
                    d="M16 3.5 19.5 12.5 28.5 16 19.5 19.5 16 28.5 12.5 19.5 3.5 16 12.5 12.5 16 3.5Z"
                    fill="currentColor"
                  />
                  <circle cx="25.5" cy="6.5" r="2.5" fill="currentColor" />
                </svg>
              </span>
              <p className="chat-empty__eyebrow">
                A LITTLE HELP GOES A LONG WAY
              </p>
              <h1 id="welcome-title">What can I help with?</h1>
              <p className="chat-empty__description">
                Ask a question, explore an idea, or start something new.
              </p>
            </section>
          )}

          <div className="chat-composer-wrap">
            {chatError && (
              <p className="chat-composer__error" role="alert">
                {chatError}
              </p>
            )}
            <form className="chat-composer" onSubmit={sendMessage}>
              <label className="sr-only" htmlFor="chat-prompt">
                Message Luma
              </label>
              <textarea
                id="chat-prompt"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder="Message Luma..."
                rows={1}
                value={draft}
              />
              <div className="chat-composer__toolbar">
                <div className="chat-composer__tools">
                  <span className="chat-composer__hint">
                    Enter to send · Shift + Enter for a new line
                  </span>
                </div>
                <div className="chat-composer__actions">
                  <button
                    aria-label="Send message"
                    className="chat-composer__send"
                    disabled={!draft.trim() || isSending || isLoadingHistory}
                    type="submit"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 19V5m0 0L6 11m6-6 6 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
            <p className="chat-composer__disclaimer">
              Luma can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
