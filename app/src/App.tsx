// app/src/App.tsx
// Bridge top-level router: checks auth state and profile existence,
// routes to Login/Signup (signedOut), Onboarding (no profile), or Main app.
// Implements FRONTEND-01, FRONTEND-02 (auth flow gating).
import { type ReactNode, useEffect, useState } from "react";
import { currentUser } from "./lib/auth";
import { getCurrentUserProfile, type UserRecord } from "./lib/profile";
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
import { OnboardingStatusBar } from "./components/OnboardingStatusBar";
import { ErrorRetry } from "./components/ErrorRetry";
import { HomeSupport } from "./screens/HomeSupport";
import { HomeComfort } from "./screens/HomeComfort";
import { getTodayCheckIn, saveCheckIn } from "./lib/dashboard";
import { localDate, type CheckInValues } from "./lib/checkin";
import type { ScenarioId } from "./lib/practice";

type AuthState = "loading" | "signedOut" | "signedIn";
type AuthView = "login" | "signup";

function App() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [authView, setAuthView] = useState<AuthView>("login");
  const [profile, setProfile] = useState<UserRecord | null>(null);

  async function checkAuth() {
    setAuthState("loading");
    try {
      await currentUser();
      setProfile(await getCurrentUserProfile());
      setAuthState("signedIn");
    } catch {
      setAuthState("signedOut");
    }
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
  } else if (!profile) {
    content = <Onboarding onComplete={setProfile} />;
  } else {
    content = (
      <MainApp
        profile={profile}
        onProfileChange={setProfile}
        onSignOut={() => {
          setProfile(null);
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
  const [checkIn, setCheckIn] = useState<CheckInValues | null>(null);
  const [day, setDay] = useState(localDate());
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
    level: 1 | 2;
  }>();
  const [comfort, setComfort] = useState(false);
  const [tool, setTool] = useState<SupportTool | null>(null);
  async function load(retry = false) {
    if (retry) {
      setLoading(true);
      setError("");
    }
    try {
      const user = await currentUser();
      setUserId(user.userId);
      setCheckIn(await getTodayCheckIn(user.userId));
      setDay(localDate());
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Your check-in could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    const fresh = () => {
      if (localDate() !== day) void load(true);
    };
    window.addEventListener("focus", fresh);
    const timer = setInterval(fresh, 60000);
    return () => {
      window.removeEventListener("focus", fresh);
      clearInterval(timer);
    };
  }, [day]);
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
  if (loading) body = <LoadingSpinner />;
  else if (error)
    body = <ErrorRetry error={error} onRetry={() => void load(true)} />;
  else if (!checkIn)
    body = (
      <CheckIn
        firstName={profile.firstName ?? ""}
        onSave={async (values) => {
          const saved = await saveCheckIn(userId, values);
          setCheckIn(saved);
          setDay(localDate());
        }}
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
        onTool={setTool}
        onBack={() => setTool(null)}
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
          />
        )}
        {screen === "practice" && (
          <Practice
            initialScenario={practice?.scenario}
            initialLevel={practice?.level}
          />
        )}
        {screen === "dms" && (
          <Dms
            userId={userId}
            initialPeerId={peerId}
            onEvents={() => openEvents()}
            onOpenCircles={() => navigate("circles")}
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
      <OnboardingStatusBar />
      <div className="main-scroll bridge-scroll" key={tool ?? screen}>
        {body}
      </div>
      {!loading && !error && checkIn && !tool && !comfort && (
        <DashboardNav
          currentScreen={screen}
          feeling={checkIn.feeling}
          onNavigate={navigate}
          onTool={setTool}
        />
      )}
    </div>
  );
}

export default App;
