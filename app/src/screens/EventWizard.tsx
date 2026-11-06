// The Make three-step event wizard saves real host details, invitations, and reminders.
import { useMemo, useRef, useState, type FormEvent } from "react";
import { OnboardingMo as Mo } from "../components/OnboardingMo";
import { CommunityNotice } from "../components/CommunityNotice";
import { localDate } from "../lib/checkin";
import { eventFormSchema, overlaps, type EventForm } from "../lib/eventForms";
import { createEvent, getEvent, type EventRecord } from "../lib/data";
import { rsvpEvent } from "../lib/eventActions";
import {
  action,
  type Group,
  type Contact,
  type Member,
} from "../lib/community";
import { useOnline } from "../lib/useOnline";
function Segments<T extends string>({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="wizard-segments" role="group" aria-label={label}>
      {values.map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
export function EventWizard({
  userId,
  groups,
  contacts,
  members,
  events,
  initialCircleId,
  onCreated,
  onBack,
  textFirst,
}: {
  userId: string;
  groups: Group[];
  contacts: Contact[];
  members: Record<string, Member>;
  events: EventRecord[];
  initialCircleId?: string;
  onCreated: (event: EventRecord, notice: string) => void;
  onBack: () => void;
  textFirst: boolean;
}) {
  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }, []);
  const [form, setForm] = useState<EventForm>({
    what: "",
    date: localDate(tomorrow),
    time: "18:00",
    durationMinutes: 60,
    format: textFirst ? "text" : "inPerson",
    venue: "",
    whereText: "",
    joinUrl: "",
    comfortSound: "Quiet",
    comfortLighting: "Soft",
    comfortSize: 6,
    exitPlan: "",
    circleId: initialCircleId ?? "",
    reminder: "oneHour",
    tellTrustedPerson: false,
  });
  const [step, setStep] = useState(1);
  const [invited, setInvited] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const stableId = useRef(crypto.randomUUID());
  const online = useOnline();
  const update = <K extends keyof EventForm>(key: K, value: EventForm[K]) => {
    setForm((s) => ({ ...s, [key]: value }));
    setError("");
  };
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(tomorrow);
    d.setDate(d.getDate() + i);
    return d;
  }), [tomorrow]);
  const proposedDate = new Date(`${form.date}T${form.time}`);
  const proposed = {
    whenAt: Number.isFinite(proposedDate.getTime())
      ? proposedDate.toISOString()
      : null,
    durationMinutes: form.durationMinutes,
  };
  const clash = events.find((e) => overlaps(e, proposed));
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (step === 1) {
      if (!form.what.trim()) {
        setError("Name your event.");
        return;
      }
      if (Date.parse(`${form.date}T${form.time}`) <= Date.now()) {
        setError("Choose a start time in the future.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      const valid = eventFormSchema.safeParse(form);
      if (!valid.success) {
        setError(valid.error.issues[0]?.message ?? "Check your event details.");
        return;
      }
      setStep(3);
      return;
    }
    if (!online) return;
    setBusy(true);
    try {
      const valid = eventFormSchema.parse(form);
      const input = {
        id: stableId.current,
        what: valid.what,
        whenAt: new Date(`${valid.date}T${valid.time}`).toISOString(),
        durationMinutes: valid.durationMinutes,
        format: valid.format,
        venue: valid.format === "inPerson" ? valid.venue : undefined,
        whereText: valid.whereText || undefined,
        joinUrl:
          valid.format === "inPerson" ? undefined : valid.joinUrl || undefined,
        comfortSound: valid.comfortSound,
        comfortLighting: valid.comfortLighting,
        comfortSize: valid.comfortSize,
        exitPlan: valid.exitPlan || undefined,
        circleId: valid.circleId || undefined,
        reminder: valid.reminder,
        tellTrustedPerson: valid.tellTrustedPerson,
        creatorId: userId,
        goingCount: 0,
      };
      const created = (await getEvent(input.id)) ?? (await createEvent(input));
      await rsvpEvent(created.id, "going");
      if (invited.length && !valid.circleId)
        await action({
          action: "invite-event",
          targetId: created.id,
          text: JSON.stringify(invited),
        });
      let notice = "Event created. Your RSVP and reminder are saved.";
      if (valid.tellTrustedPerson) {
        const shared = await action({
          action: "share-event",
          targetId: created.id,
        });
        notice +=
          (shared.notified ?? 0) > 0
            ? " Your connected trusted person was notified."
            : " No trusted person is connected with event-sharing permission yet.";
      }
      onCreated(created, notice);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The event could not be saved. Your choices are still here.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      noValidate
      className="community-page event-wizard"
      onSubmit={(event) => void submit(event)}
    >
      <div className="community-inner-header">
        <button
          type="button"
          className="round-back"
          aria-label="Back"
          disabled={busy}
          onClick={() => (step === 1 ? onBack() : setStep(step - 1))}
        >
          ‹
        </button>
        <strong>Create event</strong>
        <span />
      </div>
      <CommunityNotice online={online} error={error} />
      <fieldset disabled={busy} className="wizard-body">
        <div className="event-progress">
          <span>Step {step} of 3</span>
          <div
            role="progressbar"
            aria-label="Event progress"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={3}
          >
            <i style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>
        {step === 1 ? (
          <>
            <h2 className="field-label">What & when</h2>
            <label className="wizard-label">Host it in</label>
            <div className="wizard-chips">
              <button
                type="button"
                aria-pressed={!form.circleId}
                onClick={() => update("circleId", "")}
              >
                Outside circles
              </button>
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={form.circleId === g.id}
                  onClick={() => update("circleId", g.id)}
                >
                  {g.name}
                </button>
              ))}
            </div>
            <label className="wizard-label">
              Event name
              <input
                value={form.what}
                onChange={(e) => update("what", e.target.value)}
                maxLength={120}
                required
              />
            </label>
            <label className="wizard-label">Date</label>
            <div className="week-strip">
              {days.map((d) => (
                <button
                  type="button"
                  key={localDate(d)}
                  className={form.date === localDate(d) ? "on" : ""}
                  onClick={() => update("date", localDate(d))}
                >
                  <small>
                    {d.toLocaleDateString([], { weekday: "short" })}
                  </small>
                  <strong>{d.getDate()}</strong>
                </button>
              ))}
            </div>
            <label className="wizard-label">
              Pick another date
              <input
                type="date"
                value={form.date}
                min={localDate()}
                onChange={(e) => update("date", e.target.value)}
              />
            </label>
            <label className="wizard-label">
              Start time
              <input
                type="time"
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
              />
            </label>
            <label className="wizard-label">
              Duration
              <Segments
                label="Duration"
                values={["30 min", "1 hour", "2 hours"]}
                value={
                  form.durationMinutes === 30
                    ? "30 min"
                    : form.durationMinutes === 60
                      ? "1 hour"
                      : "2 hours"
                }
                onChange={(v) =>
                  update(
                    "durationMinutes",
                    v === "30 min" ? 30 : v === "1 hour" ? 60 : 120,
                  )
                }
              />
            </label>
            <div className="wizard-tip">
              <Mo size={38} />
              <span>
                {clash
                  ? `This overlaps with ${clash.what}. You can choose another time.`
                  : "Shorter is easier the first time."}
              </span>
            </div>
          </>
        ) : step === 2 ? (
          <>
            <h2 className="field-label">Where & vibe</h2>
            <Segments
              label="Event format"
              values={["In person", "Online"]}
              value={form.format === "inPerson" ? "In person" : "Online"}
              onChange={(v) =>
                update("format", v === "In person" ? "inPerson" : "text")
              }
            />
            {form.format === "inPerson" ? (
              <>
                <label className="wizard-label">
                  Meeting place
                  <input
                    value={form.venue}
                    onChange={(e) => update("venue", e.target.value)}
                    maxLength={200}
                    placeholder="Enter a place"
                  />
                </label>
                <label className="wizard-label">
                  Address or meeting details
                  <input
                    value={form.whereText}
                    onChange={(e) => update("whereText", e.target.value)}
                    maxLength={300}
                  />
                </label>
              </>
            ) : (
              <>
                <Segments
                  label="Online format"
                  values={["Text", "Voice", "Video"]}
                  value={
                    form.format === "text"
                      ? "Text"
                      : form.format === "voice"
                        ? "Voice"
                        : "Video"
                  }
                  onChange={(v) =>
                    update(
                      "format",
                      v === "Text" ? "text" : v === "Voice" ? "voice" : "video",
                    )
                  }
                />
                {form.format === "text" ? (
                  <p className="wizard-tip">
                    {form.circleId
                      ? "Meet in this circle’s text chat."
                      : "Add a meeting link or meeting instructions so people know where to join."}
                  </p>
                ) : null}
                <label className="wizard-label">
                  Meeting link{form.format === "text" ? " (optional)" : ""}
                  <input
                    type="url"
                    value={form.joinUrl}
                    onChange={(e) => update("joinUrl", e.target.value)}
                    placeholder="https://"
                    maxLength={1000}
                  />
                </label>
                <label className="wizard-label">
                  Meeting instructions
                  <input
                    value={form.whereText}
                    onChange={(e) => update("whereText", e.target.value)}
                    maxLength={300}
                  />
                </label>
              </>
            )}
            <label className="wizard-label">
              Sound
              <Segments
                label="Sound"
                values={["Quiet", "Soft music", "Loud music"]}
                value={form.comfortSound}
                onChange={(v) => update("comfortSound", v)}
              />
            </label>
            <label className="wizard-label">
              Lighting
              <Segments
                label="Lighting"
                values={["Soft", "Bright", "Dim"]}
                value={form.comfortLighting}
                onChange={(v) => update("comfortLighting", v)}
              />
            </label>
            <div className="wizard-size">
              <span>Group size</span>
              <div>
                <button
                  type="button"
                  aria-label="Decrease group size"
                  disabled={form.comfortSize <= 2}
                  onClick={() => update("comfortSize", form.comfortSize - 1)}
                >
                  −
                </button>
                <strong>{form.comfortSize}</strong>
                <button
                  type="button"
                  aria-label="Increase group size"
                  disabled={form.comfortSize >= 100}
                  onClick={() => update("comfortSize", form.comfortSize + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <label className="wizard-label">
              Break or exit plan
              <textarea
                value={form.exitPlan}
                onChange={(e) => update("exitPlan", e.target.value)}
                rows={2}
                maxLength={300}
                placeholder="What can someone do if they need a break?"
              />
            </label>
          </>
        ) : (
          <>
            <h2 className="field-label">Who & review</h2>
            {form.circleId ? (
              <div className="wizard-tip">
                Everyone in the circle can see this event.
              </div>
            ) : (
              <>
                <span className="wizard-label">Invite contacts</span>
                {contacts.filter((c) => c.status === "accepted" && c.contactId)
                  .length === 0 ? (
                  <div className="community-empty">
                    No accepted contacts yet. You can still create an event.
                  </div>
                ) : (
                  contacts
                    .filter((c) => c.status === "accepted" && c.contactId)
                    .map((c) => (
                      <label className="invite-contact" key={c.id}>
                        <span>
                          {members[c.contactId!]?.name ?? "Bridge member"}
                        </span>
                        <input
                          type="checkbox"
                          checked={invited.includes(c.contactId!)}
                          onChange={(e) =>
                            setInvited((rows) =>
                              e.target.checked
                                ? [...rows, c.contactId!]
                                : rows.filter((id) => id !== c.contactId),
                            )
                          }
                        />
                      </label>
                    ))
                )}
              </>
            )}
            <label className="wizard-label">
              Remind me
              <Segments
                label="Remind me"
                values={["1 hour", "1 day", "Both"]}
                value={
                  form.reminder === "oneHour"
                    ? "1 hour"
                    : form.reminder === "oneDay"
                      ? "1 day"
                      : "Both"
                }
                onChange={(v) =>
                  update(
                    "reminder",
                    v === "1 hour"
                      ? "oneHour"
                      : v === "1 day"
                        ? "oneDay"
                        : "both",
                  )
                }
              />
            </label>
            {form.format === "inPerson" && (
              <label className="invite-contact">
                <span>Notify my connected trusted person</span>
                <input
                  type="checkbox"
                  checked={form.tellTrustedPerson}
                  onChange={(e) =>
                    update("tellTrustedPerson", e.target.checked)
                  }
                />
              </label>
            )}
            <span className="wizard-preview-label">PREVIEW</span>
            <div className="event-row-card">
              <span className="date-tile">
                <small>
                  {new Date(`${form.date}T12:00`)
                    .toLocaleDateString([], { weekday: "short" })
                    .toUpperCase()}
                </small>
                <strong>{new Date(`${form.date}T12:00`).getDate()}</strong>
              </span>
              <div className="event-copy">
                <strong>{form.what}</strong>
                <span>
                  {form.date} · {form.time}
                </span>
                <span>
                  {form.format === "inPerson" ? form.venue : form.format}
                </span>
                <span className="meta-pill">
                  Up to {form.comfortSize} people
                </span>
              </div>
            </div>
          </>
        )}
      </fieldset>
      <div className="wizard-footer">
        <button type="submit" disabled={busy || (step === 3 && !online)}>
          {busy ? "Saving…" : step === 3 ? "Create event" : "Next"}
        </button>
      </div>
    </form>
  );
}
