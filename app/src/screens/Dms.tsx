// Make Messages uses participant-only live threads and server-checked request, block, and safety actions.
import { DM_IDEAS_CONTEXT } from '../../amplify/functions/preview/prompts';
import { useEffect, useRef, useState } from "react";
import { CommunityHeader } from "../components/CommunityHeader";
import { CommunityNotice } from "../components/CommunityNotice";
import { MessageComposer } from "../components/MessageComposer";
import { PersonAvatar } from "../components/PersonAvatar";
import { OnboardingMo as Mo } from "../components/OnboardingMo";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  readThreadStates,
  markThreadRead,
  listMembers,
  observeContacts,
  observeRequests,
  observeDirectMessages,
  observePrivateThread,
  report,
  action,
  type Contact,
  type Request,
  type DirectMessage,
  type Member,
} from "../lib/community";
import { sendDm, respondToRequest, threadId } from "../lib/dm";
import { messageTime, dayLabel } from "../lib/chat";
import { useOnline } from "../lib/useOnline";
import { withMoMessages } from "../lib/moContext";
import "./Community.css";
interface Props {
  userId: string;
  initialPeerId?: string;
  onOpenCircles: () => void;
  personalContext: string;
}
export function Dms({ userId, initialPeerId, onOpenCircles, personalContext }: Props) {
  const [members, setMembers] = useState<Record<string, Member>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [allMessages, setAllMessages] = useState<DirectMessage[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [peer, setPeer] = useState(initialPeerId ?? "");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(!!initialPeerId);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [seen, setSeen] = useState<Record<string, number>>({});
  const online = useOnline();
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    void Promise.all([listMembers(), readThreadStates()])
      .then(([rows, read]) => {
        if (alive) {
          setMembers(rows);
          setSeen(read);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) {
          setError("Messages could not be loaded. Please try again.");
          setLoading(false);
        }
      });
    const fail = () =>
      setError("Messages could not reconnect. Your draft is still here.");
    const cs = observeContacts(setContacts, fail);
    const rs = observeRequests(setRequests, fail);
    const ms = observeDirectMessages(setAllMessages, fail);
    return () => {
      alive = false;
      cs.unsubscribe();
      rs.unsubscribe();
      ms.unsubscribe();
    };
  }, [retry, online]);
  useEffect(() => {
    if (!peer) return;
    setThreadLoading(true);
    setMessages([]);
    setWaiting(false);
    const sub = observePrivateThread(
      threadId(userId, peer),
      (rows) => {
        setMessages(rows);
        setThreadLoading(false);
        const last = rows.at(-1)?.createdAtMs ?? 0;
        setSeen((s) => ({ ...s, [peer]: last }));
        if (last)
          void markThreadRead(userId, peer, last).catch(() =>
            setNotice(
              "Messages are visible, but the read marker could not be saved.",
            ),
          );
      },
      () => {
        setError(
          "This conversation could not reconnect. Your draft is still here.",
        );
        setThreadLoading(false);
      },
    );
    return () => sub.unsubscribe();
  }, [peer, userId, retry, online]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "instant" });
  }, [messages]);
  const blocked = new Set(
    contacts.filter((c) => c.status === "blocked").map((c) => c.contactId),
  );
  const incoming = requests.filter(
    (r) =>
      r.toUserId === userId &&
      r.status === "pending" &&
      !blocked.has(r.fromUserId),
  );
  const outgoing = requests.filter(
    (r) => r.fromUserId === userId && r.status === "pending",
  );
  const peers = Array.from(
    new Set([
      ...contacts
        .filter((c) => c.status === "accepted" && !blocked.has(c.contactId))
        .map((c) => c.contactId!)
        .filter(Boolean),
      ...allMessages.flatMap((m) =>
        m.participants.filter(
          (id): id is string => !!id && id !== userId && !blocked.has(id),
        ),
      ),
    ]),
  );
  peers.sort(
    (a, b) =>
      (allMessages.filter((m) => m.participants.includes(b)).at(-1)
        ?.createdAtMs ?? 0) -
      (allMessages.filter((m) => m.participants.includes(a)).at(-1)
        ?.createdAtMs ?? 0),
  );
  const accepted = contacts.some(
    (c) => c.contactId === peer && c.status === "accepted",
  );
  const pending = outgoing.some((r) => r.toUserId === peer) || waiting;
  async function respond(request: Request, accept: boolean) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await respondToRequest(request.id, accept);
      if (!result.ok)
        throw new Error(result.reason || "The request could not be updated.");
      setRequests((rows) =>
        rows.map((r) =>
          r.id === request.id
            ? { ...r, status: accept ? "accepted" : "declined" }
            : r,
        ),
      );
      if (accept) {
        setPeer(request.fromUserId);
        setNotice("Request accepted. You can now message each other.");
      } else setNotice("Request deleted.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The request could not be updated.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function block(peerId: string, alsoReport = false) {
    setBusy(true);
    setError("");
    try {
      if (alsoReport) await report(peerId, "user", "Unsafe message request");
      await action({ action: "block", targetId: peerId });
      setContacts((rows) => [
        ...rows.filter((c) => c.contactId !== peerId),
        {
          id: `${userId}#${peerId}`,
          userId,
          contactId: peerId,
          status: "blocked",
        } as Contact,
      ]);
      if (peer === peerId) setPeer("");
      setNotice(
        alsoReport
          ? "Report sent for review. Person blocked."
          : "Person blocked.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The action could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <LoadingSpinner />;
  if (peer) {
    const name = members[peer]?.name ?? "Bridge member";
    return (
      <div className="community-page private-thread text-screen">
        <div className="community-inner-header">
          <button
            className="round-back"
            aria-label="Back to messages"
            onClick={() => {
              setPeer("");
              setError("");
              setNotice("");
            }}
          >
            ‹
          </button>
          <div>
            <strong>{name}</strong>
            <small>
              {accepted ? "Private conversation" : "Message request"}
            </small>
          </div>
          <PersonAvatar name={name} tint="var(--tint)" size={40} />
        </div>
        <CommunityNotice
          online={online}
          error={error}
          onRetry={() => {
            setError("");
            setRetry((n) => n + 1);
          }}
        />
        {notice && (
          <p className="community-notice" role="status">
            {notice}
          </p>
        )}
        <div className="private-safety">
          <button disabled={busy || !online} onClick={() => void block(peer)}>
            Block {name}
          </button>
          <button
            disabled={busy || !online}
            onClick={() => {
              setBusy(true);
              void report(peer, "user", "Direct message concern")
                .then(() => setNotice("Report sent for review."))
                .catch(() => setError("The report could not be saved."))
                .finally(() => setBusy(false));
            }}
          >
            Report
          </button>
        </div>
        <div className="real-messages">
          {threadLoading ? (
            <LoadingSpinner />
          ) : !messages.length ? (
            <div className="community-empty">
              {accepted
                ? "No messages yet. Start when you’re ready."
                : pending
                  ? "Your message request is waiting. They choose whether to accept."
                  : "Your first message will be a request. They choose whether to accept."}
            </div>
          ) : (
            messages.map((m, i) => {
              const me = m.senderId === userId;
              return (
                <div key={m.id}>
                  {(i === 0 ||
                    dayLabel(m.timestamp) !==
                      dayLabel(messages[i - 1].timestamp)) && (
                    <div className="today-divider">{dayLabel(m.timestamp)}</div>
                  )}
                  <div className={`chat-group${me ? " me" : ""}`}>
                    {!me && (
                      <PersonAvatar name={name} size={28} tint="var(--tint)" />
                    )}
                    <div>
                      <div className={`real-message-bubble${me ? " own" : ""}`}>
                        {m.content}
                      </div>
                      <div className="chat-meta">
                        {messageTime(m.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={end} />
        </div>
        <MessageComposer
          name={name}
          context={DM_IDEAS_CONTEXT(messages.filter(m=>m.senderId!==userId).at(-1)?.content)}
          personalContext={withMoMessages(
            personalContext,
            messages.map((message) => ({
              speaker: message.senderId === userId ? "You" : name,
              text: message.content,
            })),
          )}
          online={online}
          disabled={blocked.has(peer) || (pending && !accepted)}
          onSend={async (text, id) => {
            const result = await sendDm(peer, text, id);
            if (result.crisis)
              throw new Error(
                "Reach out to a trusted person for support. Your message was not sent.",
              );
            if (result.held) {
              setWaiting(true);
              setNotice("Message request sent. They choose whether to accept.");
            } else if (!result.delivered)
              throw new Error(
                result.reason || "Your message could not be sent.",
              );
          }}
        />
      </div>
    );
  }
  return (
    <div className="community-page tab-screen">
      <CommunityHeader
        tab="dms"
        onCircles={onOpenCircles}
        onMessages={() => {}}
      />
      <CommunityNotice
        online={online}
        error={error}
        onRetry={() => {
          setError("");
          setRetry((n) => n + 1);
        }}
      />
      <div className="tab-screen-content circles-content">
        <span className="messages-intro">
          You can message people you’ve met in circles.
        </span>
        {notice && <p role="status">{notice}</p>}
        {!peers.length && (
          <div className="community-empty">
            No conversations yet. Open a circle and tap someone’s name to send a
            request.
          </div>
        )}
        {peers.map((id) => {
          const name = members[id]?.name ?? "Bridge member";
          const last = allMessages
            .filter((m) => m.participants.includes(id))
            .at(-1);
          const unread =
            last &&
            last.senderId !== userId &&
            last.createdAtMs > (seen[id] ?? 0);
          return (
            <button
              key={id}
              className="dm-list-row"
              onClick={() => {
                setPeer(id);
                setError("");
                setNotice("");
              }}
            >
              <PersonAvatar name={name} size={48} tint="var(--tint)" />
              <span className="dm-row-copy">
                <span>
                  <strong>{name}</strong>
                  <small>{messageTime(last?.timestamp)}</small>
                </span>
                <span className={unread ? "unread-copy" : ""}>
                  {last?.content ?? "Say hi when you’re ready."}
                </span>
              </span>
              {unread && <i className="unread-dot" aria-label="Unread" />}
            </button>
          );
        })}
        <h2 className="request-title">Message requests</h2>
        {!incoming.length && (
          <div className="community-empty">
            No new requests. You choose who can message you.
          </div>
        )}
        {incoming.map((request) => {
          const name = members[request.fromUserId]?.name ?? "Bridge member";
          return (
            <article
              key={request.id}
              className={`request-card${request.unsafe ? " unsafe-request" : ""}`}
            >
              <div className="request-person">
                <PersonAvatar name={name} tint="#FFFFFF" size={44} />
                <div>
                  <strong>{name}</strong>
                  <span>You haven’t talked yet</span>
                </div>
              </div>
              {request.unsafe ? (
                <div className="request-warning">
                  <Mo mood="worried" size={40} />
                  <span>
                    Mo held this message because it may ask for money, private
                    details, or something unsafe. Only you can see this warning.
                  </span>
                </div>
              ) : (
                <p>{request.firstMessage}</p>
              )}
              <div className="request-actions">
                {request.unsafe ? (
                  <button
                    disabled={busy || !online}
                    onClick={() => void block(request.fromUserId, true)}
                  >
                    Report and block
                  </button>
                ) : (
                  <button
                    disabled={busy || !online}
                    onClick={() => void respond(request, true)}
                  >
                    Accept
                  </button>
                )}
                <button
                  disabled={busy || !online}
                  onClick={() => void respond(request, false)}
                >
                  {request.unsafe ? "Delete" : "Decline"}
                </button>
              </div>
            </article>
          );
        })}
        {outgoing
          .filter((r) => !blocked.has(r.toUserId))
          .map((request) => (
            <div className="community-empty" key={request.id}>
              Request sent to{" "}
              {members[request.toUserId]?.name ?? "a Bridge member"}. Waiting
              for their reply.
            </div>
          ))}
      </div>
    </div>
  );
}
