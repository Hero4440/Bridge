// app/src/App.tsx
// Bridge top-level router: checks auth state and profile existence,
// routes to Login/Signup (signedOut), Onboarding (no profile), or Main app.
// Implements FRONTEND-01, FRONTEND-02 (auth flow gating).
import { type ReactNode, useEffect, useState } from "react";
import { authSignOut, currentUser } from "./lib/auth";
import { getCurrentUserProfile, type UserRecord } from "./lib/profile";
import { loadAppSession } from "./lib/session";
import { isThemeName, themeStyle } from "./lib/theme";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { type Screen } from "./components/NavBar";
import { Login } from "./screens/Login";
import { Signup } from "./screens/Signup";
import { Onboarding } from "./screens/Onboarding";
import { Home } from "./screens/Home";
import { Me } from "./screens/Me";
import { Circles } from "./screens/Circles";
import { Events } from "./screens/Events";
import { Dms } from "./screens/Dms";
import { Practice } from "./screens/Practice";
import { CheckIn } from "./screens/CheckIn";
import { DashboardNav, type SupportTool } from "./components/DashboardNav";
import { ErrorRetry } from "./components/ErrorRetry";
import { HomeSupport } from "./screens/HomeSupport";
import { HomeComfort } from "./screens/HomeComfort";
import { MoChat } from "./screens/MoChat";
import { saveCheckIn } from "./lib/dashboard";
import type { CheckInValues } from "./lib/checkin";
import type { ScenarioId } from "./lib/practice";
import { BadgeCelebration } from "./components/BadgeCelebration";
import { moContext } from "./lib/moContext";

type AuthState = "loading" | "signedOut" | "signedIn";
type AuthView = "login" | "signup";

function App() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [authView, setAuthView] = useState<AuthView>("login");
  const [profile, setProfile] = useState<UserRecord | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  async function checkAuth() {
    setAuthState("loading");
    setProfileError(null);
    const session = await loadAppSession(currentUser, getCurrentUserProfile);
    if (session.status === "signedOut") {
      setProfile(null);
      setAuthState("signedOut");
    } else if (session.status === "profileError") {
      setProfile(null);
      setProfileError(session.error);
      setAuthState("signedIn");
    } else {
      setProfile(session.profile);
      setAuthState("signedIn");
    }
  }

  async function handleSignOut() {
    await authSignOut();
    setProfile(null);
    setProfileError(null);
    setAuthState("signedOut");
  }

  useEffect(() => {
    checkAuth();
  }, []);

  let content: ReactNode;

  if (authState === "loading") {
    content = <LoadingSpinner />;
  } else if (authState === "signedOut") {
    if (authView === "signup") {
      content = (
        <Signup
          onSignedUp={() => void checkAuth()}
          onSwitchToLogin={() => setAuthView("login")}
        />
      );
    } else {
      content = (
        <Login
          onSignedIn={() => void checkAuth()}
          onSwitchToSignup={() => setAuthView("signup")}
        />
      );
    }
  } else if (profileError) {
    content = (
      <div>
        <ErrorRetry error={`You're signed in, but your profile couldn't load. ${profileError}`} onRetry={() => void checkAuth()} />
        <button className="quiet-action" style={{ display: "block", margin: "0 auto" }} onClick={() => void handleSignOut()}>Log out and try again</button>
      </div>
    );
  } else if (!profile) {
    content = <Onboarding onComplete={setProfile} />;
  } else {
    content = (
      <MainApp
        profile={profile}
        onProfileChange={setProfile}
        onSignOut={() => {
          setProfile(null);
          setProfileError(null);
          setAuthState("signedOut");
        }}
      />
    );
  }

  const selectedTheme = isThemeName(profile?.theme) ? profile.theme : "dawn";
  const appClass = [
    "bridge-app",
    profile?.comfortCalmMode ? "calm-mode" : "",
    profile?.comfortTextSize === "large" ? "text-large" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="stage">
      <div className="phone">
        <div className={appClass} style={themeStyle(selectedTheme)}>
          {content}
        </div>
      </div>
    </div>
  );
}

function MainApp({
  onSignOut,
  profile,
  onProfileChange,
}: {
  onSignOut: () => void;
  profile: UserRecord;
  onProfileChange: (profile: UserRecord) => void;
}) {
  const [screen, setScreen] = useState<Screen>(() =>
    new URLSearchParams(location.search).has("event") ? "events" : "home",
  );
  const [userId, setUserId] = useState("");
  // MainApp mounts after sign-in, so every signed-in session starts with a fresh check-in.
  const [checkIn, setCheckIn] = useState<CheckInValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventTarget, setEventTarget] = useState<{
    id?: string;
    circleId?: string;
    create?: boolean;
  }>(() => ({
    id: new URLSearchParams(location.search).get("event") ?? undefined,
  }));
  const [peerId, setPeerId] = useState<string>();
  const [circleId, setCircleId] = useState<string>();
  const [practice, setPractice] = useState<{
    scenario: ScenarioId;
    level: 1 | 2 | 3;
  }>();
  const [comfort, setComfort] = useState(false);
  const [moChat, setMoChat] = useState(false);
  const [tool, setTool] = useState<SupportTool | null>(null);
  const [toolOpenedAt, setToolOpenedAt] = useState(0);
  const [lowDebrief, setLowDebrief] = useState(false);
  async function load(retry = false) {
    if (retry) {
      setLoading(true);
      setError("");
    }
    try {
      const user = await currentUser();
      setUserId(user.userId);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Your session could not be started.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  function navigate(next: Screen) {
    setTool(null);
    setScreen(next);
    if (next === "circles") setCircleId(undefined);
    if (next === "practice") setPractice(undefined);
  }
  function openEvents(id?: string, circleId?: string, create = false) {
    setEventTarget({ id, circleId, create });
    setScreen("events");
  }
  function openMessage(id?: string) {
    setPeerId(id);
    setScreen("dms");
  }
  let body: ReactNode;
  const personalContext = checkIn
    ? moContext(profile, checkIn, screen)
    : "";
  if (loading) body = <LoadingSpinner />;
  else if (error)
    body = <ErrorRetry error={error} onRetry={() => void load(true)} />;
  else if (!checkIn)
    body = (
      <CheckIn
        firstName={profile.firstName ?? ""}
        calmMode={!!profile.comfortCalmMode}
        onSave={async (values) => {
          const saved = await saveCheckIn(userId, values);
          setCheckIn(saved);
        }}
      />
    );
  else if (moChat)
    body = (
      <MoChat
        personalContext={personalContext}
        onBack={() => setMoChat(false)}
      />
    );
  else if (comfort)
    body = (
      <HomeComfort
        profile={profile}
        onSaved={onProfileChange}
        onBack={() => setComfort(false)}
      />
    );
  else if (tool)
    body = (
      <HomeSupport
        key={tool}
        tool={tool}
        openedAt={toolOpenedAt}
        onBack={() => setTool(null)}
        onTalkLater={() => {
          setLowDebrief(true);
          setTool(null);
        }}
      />
    );
  else
    body = (
      <>
        {screen === "home" && (
          <Home
            onMessage={openMessage}
            onEvent={openEvents}
            profile={profile}
            checkIn={checkIn}
            onPractice={(scenario, level) => {
              setPractice({ scenario, level });
              setScreen("practice");
            }}
            onCircle={(id) => {
              setCircleId(id);
              setScreen("circles");
            }}
            onComfort={() => setComfort(true)}
            onMoChat={() => setMoChat(true)}
            angryDebrief={lowDebrief}
            onDebriefTalk={() => setLowDebrief(false)}
          />
        )}
        {screen === "circles" && (
          <Circles
            feeling={checkIn.feeling}
            profile={profile}
            userId={userId}
            initialCircleId={circleId}
            onOpenDms={openMessage}
            onEvents={openEvents}
            personalContext={personalContext}
          />
        )}
        {screen === "events" && (
          <Events
            key={`${eventTarget.id ?? ""}-${eventTarget.circleId ?? ""}-${eventTarget.create ?? false}`}
            userId={userId}
            profile={profile}
            initialEventId={eventTarget.id}
            initialCircleId={eventTarget.circleId}
            initialCreate={eventTarget.create}
            onPractice={() => {
              setPractice({ scenario: "join", level: 1 });
              setScreen("practice");
            }}
            onCircle={(id) => {
              setCircleId(id);
              setScreen("circles");
            }}
            onMessage={openMessage}
            onBack={() => navigate("circles")}
            personalContext={personalContext}
          />
        )}
        {screen === "practice" && (
          <Practice
            initialScenario={practice?.scenario}
            initialLevel={practice?.level}
            personalContext={personalContext}
            onBack={() => navigate("home")}
          />
        )}
        {screen === "dms" && (
          <Dms
            userId={userId}
            initialPeerId={peerId}
            onOpenCircles={() => navigate("circles")}
            personalContext={personalContext}
          />
        )}
        {screen === "me" && (
          <Me
            profile={profile}
            onProfileChange={onProfileChange}
            onSignOut={onSignOut}
          />
        )}
      </>
    );
  return (
    <div className="matched-main">
      <BadgeCelebration />
      <div className="main-scroll bridge-scroll" key={tool ?? screen}>
        {body}
      </div>
      {!loading && !error && checkIn && !tool && !comfort && !moChat && screen !== "practice" && (
        <DashboardNav
          currentScreen={screen}
          feeling={checkIn.feeling}
          onNavigate={navigate}
          onTool={(next) => {
            setToolOpenedAt(Date.now());
            setTool(next);
          }}
        />
      )}
    </div>
  );
}

export default App;
