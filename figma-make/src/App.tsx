// @ts-nocheck
import React from 'react';

class DCLogic extends React.Component {
  constructor(props) { super(props); this.state = {}; }
  render() { return this.renderView(this.renderVals()); }
}

// One shared Mo palette for the whole app (set from Bridge's moGradient)
const MoGradientContext = React.createContext(['#EEF4F0', '#B8D4C8', '#7FB8A8']);
var moUidCounter = 0;

class MoBase extends DCLogic {
  constructor(props) { super(props); this.uid = 'moG' + (++moUidCounter); }
  renderVals() {
    var mood = this.props.mood || 'happy';
    var size = parseInt(this.props.size, 10) || 160;
    var labels = { happy: 'Mo, smiling', worried: 'Mo, looking concerned', calm: 'Mo, calm with eyes closed' };
    return {
      px: size + 'px',
      fill: 'url(#' + this.uid + ')',
      label: labels[mood] || labels.happy,
      isHappy: mood === 'happy',
      isWorried: mood === 'worried',
      isCalm: mood === 'calm'
    };
  }
}

class Mo extends MoBase {
  static contextType = MoGradientContext;
  renderView(v) {
    return (<>
<div style={{width: v.px, height: v.px, display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="100%" height="100%" viewBox="0 0 160 160" role="img" aria-label={v.label}>
<defs>
<radialGradient id={this.uid} cx="40%" cy="30%" r="80%"><stop offset="0" stopColor={this.context[0]}></stop><stop offset="0.6" stopColor={this.context[1]}></stop><stop offset="1" stopColor={this.context[2]}></stop></radialGradient>
</defs>
<ellipse cx="80" cy="142" rx="50" ry="6" fill="#1E1B2E" opacity="0.08"></ellipse>
<g transform="translate(0 -10)">
<path d="M79.06 44.56 C97.96 44.56 118.76 41.83 129.12 51.42 C142.89 64.17 144 77.46 144 98 C144 117.65 140.27 133.64 125.43 141.09 C114.59 146.53 95.2 146 80 146 C66.99 146 45.32 147.57 35.34 143.63 C17.71 136.67 16 119.72 16 98 C16 74.89 14.14 63.48 31.69 51.08 C41.47 44.17 63.31 44.56 79.06 44.56 Z" fill={v.fill}></path>
<circle cx="48" cy="110" r="7" fill="#F29BAE" opacity="0.45"></circle>
<circle cx="112" cy="110" r="7" fill="#F29BAE" opacity="0.45"></circle>
{v.isHappy && (<>
<ellipse cx="62" cy="92" rx="8.5" ry="10.5" fill="#1E1B2E"></ellipse>
<ellipse cx="98" cy="92" rx="8.5" ry="10.5" fill="#1E1B2E"></ellipse>
<circle cx="65" cy="88" r="3.8" fill="#FFFFFF"></circle>
<circle cx="101" cy="88" r="3.8" fill="#FFFFFF"></circle>
<circle cx="60" cy="96" r="1.6" fill="#FFFFFF"></circle>
<circle cx="96" cy="96" r="1.6" fill="#FFFFFF"></circle>
<path d="M74 112 Q80 117 86 112" fill="none" stroke="#1E1B2E" strokeWidth="3.5" strokeLinecap="round"></path>
</>)}
{v.isCalm && (<>
<path d="M53 92 Q62 99 71 92" fill="none" stroke="#1E1B2E" strokeWidth="4" strokeLinecap="round"></path>
<path d="M89 92 Q98 99 107 92" fill="none" stroke="#1E1B2E" strokeWidth="4" strokeLinecap="round"></path>
<path d="M75 112 Q80 116 85 112" fill="none" stroke="#1E1B2E" strokeWidth="3.5" strokeLinecap="round"></path>
</>)}
{v.isWorried && (<>
<path d="M50 80 L64 75" fill="none" stroke="#1E1B2E" strokeWidth="3.5" strokeLinecap="round"></path>
<path d="M110 80 L96 75" fill="none" stroke="#1E1B2E" strokeWidth="3.5" strokeLinecap="round"></path>
<ellipse cx="62" cy="94" rx="7" ry="9" fill="#1E1B2E"></ellipse>
<ellipse cx="98" cy="94" rx="7" ry="9" fill="#1E1B2E"></ellipse>
<circle cx="64.5" cy="91" r="2.8" fill="#FFFFFF"></circle>
<circle cx="100.5" cy="91" r="2.8" fill="#FFFFFF"></circle>
<path d="M73 116 Q80 111 87 116" fill="none" stroke="#1E1B2E" strokeWidth="3.5" strokeLinecap="round"></path>
</>)}
</g>
</svg>
</div>
</>);
  }
}

const circleIconPaths = {
  gaming: 'M7 8h10a5 5 0 0 1 4.5 7.2l-1 2A2.5 2.5 0 0 1 16 17l-1-2H9l-1 2a2.5 2.5 0 0 1-4.5.2l-1-2A5 5 0 0 1 7 8ZM7 11v4M5 13h4M16 12h.01M19 14h.01',
  music: 'M9 18V6l10-2v12M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  anime: 'm12 2 1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z',
  cooking: 'M5 10h14v5a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-5ZM8 7c-1-1 1-2 0-4M12 7c-1-1 1-2 0-4M16 7c-1-1 1-2 0-4',
  art: 'm5 19 3.5-1 9.8-9.8-2.5-2.5L6 15.5 5 19ZM14.5 7l2.5 2.5M4 21h16',
  tech: 'M4 5h16v12H4zM8 21h8M12 17v4M8 10l2 2-2 2M13 14h3',
  film: 'M4 5h16v14H4zM8 5v14M16 5v14M4 9h4M4 15h4M16 9h4M16 15h4'
};

function PersonAvatar({ name, tint, size = 40, onClick }) {
  var tag = onClick ? 'button' : 'span';
  return React.createElement(tag, {
    onClick: onClick,
    className: 'person-avatar',
    'aria-label': onClick ? 'Message ' + name : name,
    style: { width: size + 'px', height: size + 'px', background: tint || 'var(--soft)' }
  }, (name || '?')[0]);
}

const CIRCLE_STYLE = {
  gaming: { bg: '#FFF0EA', color: '#D4733A' }, music: { bg: '#EEF0FA', color: '#5A4FB0' }, cooking: { bg: '#FFF6E8', color: '#B07A20' },
  art: { bg: '#FDE8EF', color: '#A03060' }, anime: { bg: '#FEF0FA', color: '#8A3A9A' }, tech: { bg: 'var(--tint)', color: '#3A7A5C' }, film: { bg: '#FFF0F0', color: '#C04040' }
};

function CircleGlyph({ kind, tint, size = 44, color }) {
  return <span className="circle-glyph" style={{width: size + 'px', height: size + 'px', background: tint || 'var(--soft)'}}>
    <svg width={size > 40 ? 24 : 20} height={size > 40 ? 24 : 20} viewBox="0 0 24 24" fill="none" style={{stroke: color || "var(--ink)"}} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={circleIconPaths[kind] || circleIconPaths.gaming}/></svg>
  </span>;
}

function DateTile({ day = 'SUN', date = '9' }) {
  return <span className="date-tile"><small>{day}</small><strong>{date}</strong></span>;
}

function MapThumb() {
  return <span className="map-thumb" aria-hidden="true"><svg viewBox="0 0 100 64" width="100%" height="100%"><path d="M-5 15 35 42 75 17l30 20M15-5l18 70M70-5l-8 70" fill="none" stroke="#C8C1D4" strokeWidth="5"/><circle cx="56" cy="31" r="7" fill="var(--ink)"/><circle cx="56" cy="31" r="2.5" fill="#fff"/></svg></span>;
}

function BadgeMark({ kind, size = 36 }) {
  var paths = {
    hello: 'M4 5.5h16v11H9l-5 4v-15Z',
    kind: 'M20.8 5.7c-2-2-5.2-2-7.2 0L12 7.3l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8.1a5.1 5.1 0 0 0 0-7.2Z',
    pause: 'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7',
    event: 'M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3'
  };
  return <span className={"badge-mark badge-" + kind} style={{width:size + 'px',height:size + 'px'}}><svg width={Math.round(size * .48)} height={Math.round(size * .48)} viewBox="0 0 24 24" fill="none" style={{stroke:"var(--ink)"}} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={paths[kind]}/></svg></span>;
}

// Simulated iOS keyboard (the native one is unreliable in a browser webview during demos)
function SimKey({ label, kind, width, flex, onTap, aria }) {
  var base = kind === 'special' ? '#ADB5BD' : '#FFFFFF';
  return <button type="button" aria-label={aria || label}
    onMouseDown={function (e) { e.preventDefault(); }}
    onPointerDown={function (e) {
      e.preventDefault();
      var el = e.currentTarget; el.style.background = '#E5E7EB';
      setTimeout(function () { el.style.background = base; }, 80);
      onTap();
    }}
    style={{ width: width ? width + 'px' : undefined, flex: flex || (width ? '0 0 ' + width + 'px' : 1), minWidth: 0, height: '42px', border: 'none', padding: 0, background: base, borderRadius: '5px', boxShadow: '0 1px 0 rgba(0,0,0,0.35)', fontSize: kind === 'special' && label.length > 1 ? '15px' : '17px', fontWeight: 400, color: '#000000', fontFamily: '-apple-system, "SF Pro Text", sans-serif', touchAction: 'manipulation' }}>{label}</button>;
}

function SimKeyboard({ open, num, shift, onKey, onBack, onSpace, onShift, onNum, onReturn }) {
  var letters = shift !== 'off';
  var cap = function (c) { return letters ? c.toUpperCase() : c; };
  var row = function (chars, pad) {
    return <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', padding: '6px 3px', paddingLeft: pad ? pad : undefined, paddingRight: pad ? pad : undefined }}>
      {chars.map(function (c) { return <SimKey key={c} label={num ? c : cap(c)} onTap={function () { onKey(num ? c : cap(c)); }} />; })}
    </div>;
  };
  var rows = num
    ? [['1','2','3','4','5','6','7','8','9','0'], ['-','/',':',';','(',')','$','&','@','"']]
    : [['q','w','e','r','t','y','u','i','o','p'], ['a','s','d','f','g','h','j','k','l']];
  var row3 = num ? ['.', ',', '?', '!', "'"] : ['z','x','c','v','b','n','m'];
  return <div aria-hidden={!open} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300, background: '#D1D5DB', height: '291px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', transform: open ? 'translateY(0)' : 'translateY(100%)', visibility: open ? 'visible' : 'hidden', pointerEvents: open ? 'auto' : 'none', transition: 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1), visibility 0s linear ' + (open ? '0s' : '0.25s'), userSelect: 'none', WebkitUserSelect: 'none' }}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingTop: '4px' }}>
      <div style={{ paddingTop: '4px' }}>{row(rows[0])}</div>
      {row(rows[1], num ? undefined : '18px')}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', padding: '6px 3px' }}>
        {num ? <SimKey label="#+=" kind="special" width={42} onTap={function () {}} /> : <SimKey label={shift === 'caps' ? '⇪' : '⇧'} kind="special" width={42} aria="Shift" onTap={onShift} />}
        <div style={{ flex: 1, display: 'flex', gap: '6px', justifyContent: 'center', padding: '0 6px' }}>
          {row3.map(function (c) { return <SimKey key={c} label={num ? c : cap(c)} onTap={function () { onKey(num ? c : cap(c)); }} />; })}
        </div>
        <SimKey label="⌫" kind="special" width={42} aria="Delete" onTap={onBack} />
      </div>
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', padding: '6px 3px' }}>
        <SimKey label={num ? 'ABC' : '123'} kind="special" width={42} onTap={onNum} />
        <SimKey label="space" flex={1} onTap={onSpace} />
        <SimKey label="return" kind="special" width={42} onTap={onReturn} />
      </div>
    </div>
    <div style={{ height: '21px', background: '#D1D5DB', flex: '0 0 auto' }}><div style={{ width: '134px', height: '5px', background: '#000000', opacity: 0.18, borderRadius: '999px', margin: '8px auto 0' }}></div></div>
  </div>;
}

function Segments({ opts }) {
  var idx = Math.max(0, opts.findIndex(function (o) { return o.on; }));
  return <div className="segments"><i className="seg-ind" style={{width: 'calc((100% - 6px) / ' + opts.length + ')', transform: 'translateX(' + (idx * 100) + '%)'}}></i>{opts.map(function (o, i) { return <button key={i} className={o.cls} aria-pressed={o.on} onClick={o.pick}>{o.label}</button>; })}</div>;
}

function SlideToggle({ opts }) {
  var idx = Math.max(0, opts.findIndex(function (o) { return o.on; }));
  return <div className="slide-toggle" style={{gridTemplateColumns: 'repeat(' + opts.length + ', 1fr)'}}><i className="slide-ind" style={{width: 'calc((100% - 8px) / ' + opts.length + ')', transform: 'translateX(' + (idx * 100) + '%)'}}></i>{opts.map(function (o, i) { return <button key={i} className={o.on ? 'on' : ''} aria-pressed={o.on} onClick={o.pick}>{o.label}</button>; })}</div>;
}

function BadgeIcon({ kind, color }) {
  var paths = {
    hello: 'M4 5.5h16v11H9l-5 4v-15Z',
    kind: 'M20.8 5.7c-2-2-5.2-2-7.2 0L12 7.3l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8.1a5.1 5.1 0 0 0 0-7.2Z',
    pause: 'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7',
    event: 'M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3',
    circle: 'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 15.3c.8-.2 1.6-.3 2.5-.3 3 0 5 1.5 5.5 5'
  };
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{stroke: color || 'var(--ink)'}} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[kind]}></path></svg>;
}

function MeSubHeader({ title, onBack }) {
  return <div className="sticky-header inner-header"><button onClick={onBack} aria-label="Back to Me" className="inner-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke:"var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 6-6 6 6 6"/></svg></button><span className="header-title">{title}</span><span></span></div>;
}

class BridgeBase extends DCLogic {
  renderVals() {
    var s = this.state || {};
    var self = this;
    var changeWithUndo = function (patch, message, undoPatch) {
      var token = Date.now();
      self.setState(Object.assign({}, patch, { uiToast: message, undoPatch: undoPatch, undoToken: token, toastQuiet: false }));
      setTimeout(function () {
        if (self.state.undoToken === token) self.setState({ uiToast: '', undoPatch: null, undoToken: 0 });
      }, 5000);
      return token;
    };
    // Small changes (settings, saves) get a short quiet confirmation without Undo
    var saveQuietly = function (patch, message) {
      var token = Date.now();
      self.setState(Object.assign({}, patch, { uiToast: message, undoPatch: null, undoToken: token, toastQuiet: true }));
      setTimeout(function () {
        if (self.state.undoToken === token) self.setState({ uiToast: '', undoToken: 0, toastQuiet: false });
      }, 1800);
    };
    var notify = function (message) {
      var token = Date.now();
      self.setState({ uiToast: message, undoPatch: null, undoToken: token, toastQuiet: false });
      setTimeout(function () {
        if (self.state.undoToken === token) self.setState({ uiToast: '', undoToken: 0 });
      }, 5000);
    };
    var screen = s.screen || (s.onbDone ? 'checkin' : 'onboard');
    var blankContact = { name: '', phone: '', email: '', rel: 'Parent', otherRole: '' };
    var tcs = (s.trustedContacts && s.trustedContacts.length) ? s.trustedContacts : [{ name: 'Mom', phone: '(480) 555-0142', email: '', rel: 'Parent', otherRole: '' }];
    var tc0 = tcs[0];
    var trusted = (tc0.name || '').trim() || 'Mom';
    var trustedRel = (tc0.rel === 'Other' && (tc0.otherRole || '').trim()) ? tc0.otherRole.trim() : (tc0.rel || 'Parent');
    var interests = s.interests || ['gaming'];
    var textLarge = !!s.textLarge;
    var moHelp = s.moHelp || 'some';
    var calmMode = !!s.calmMode;
    var textFirst = s.textFirst === undefined ? true : s.textFirst;
    var plainWords = !!s.plainWords;
    var stepWord = plainWords ? 'step' : 'brave step';
    var draft = s.draft || '';
    var battery = (s.ciFeel === 'over') ? 'low' : (s.ciFeel === 'ready' ? 'full' : 'okay');
    var sent = s.sent || '';
    var plan = s.plan || 'music';
    var pChoice = s.pChoice || '';
    var momOn = s.momOn === undefined ? true : s.momOn;
    var steps = (s.won ? 5 : 4) + ((s.refl && s.refl.e0 && s.refl.e0.done) ? 1 : 0);
    var circleData = {
      gaming: { name: 'Gaming', initial: 'G', tint: '#F9DCE4', here: 3, topic: 'What game got you hooked?',
        m1: ['Maya', 'Animal Crossing! I loved building my island slowly.'], m2: ['Jordan', 'Zelda for me. I still get lost exploring every corner.'],
        ask: 'Jordan, what part of Zelda are you on right now?', share: 'Mine was Minecraft. I could build for hours. What got you hooked?',
        askReply: 'Just reached the Water Temple! Want to play co-op on Friday?', shareReply: 'Minecraft is the best! Want to build something together on Friday?' },
      music: { name: 'Music', initial: 'M', tint: '#E3E0F8', here: 5, topic: 'What song is stuck in your head?',
        m1: ['Lee', 'Lo-fi beats while I cook dinner. Every night.'], m2: ['Priya', 'Anything from Studio Ghibli movies, honestly.'],
        ask: 'Priya, which Ghibli song is your favorite?', share: 'Mine is the Minecraft soundtrack. It is so calming.',
        askReply: 'Merry-Go-Round of Life! Want me to share my playlist?', shareReply: 'Yes! C418 is the best. Want to swap playlists?' },
      anime: { name: 'Anime', initial: 'A', tint: '#FBE1D8', here: 4, topic: 'Which character are you most like?',
        m1: ['Ava', 'Probably Tanjiro. I worry about everyone.'], m2: ['Kai', 'Kiki from Kiki’s Delivery Service. Always learning.'],
        m3: ['Alex', 'Hey, can you send me $20 for a gift card? Don’t tell anyone.'],
        ask: 'Kai, what do you like most about Kiki?', share: 'I think I am like Totoro. Quiet but happy.',
        askReply: 'She keeps going even when it is hard. Have you seen it?', shareReply: 'Ha, that is the best answer. Want to watch something together?' },
      cooking: { name: 'Cooking', initial: 'C', tint: 'var(--tint)', here: 2, topic: 'What is the easiest thing you can cook?',
        m1: ['Ben', 'Grilled cheese. Every single time.'], m2: ['Rosa', 'Pasta with butter and parmesan. Ten minutes.'],
        ask: 'Rosa, do you add anything else to the pasta?', share: 'I can make scrambled eggs. Still practicing!',
        askReply: 'A little black pepper! Want my exact steps?', shareReply: 'Eggs are a great start! Try adding cheese next time.' },
      art: { name: 'Art', initial: 'R', tint: '#F6E5C9', here: 3, topic: 'Show something you made this week',
        m1: ['Mia', 'I drew my cat sleeping on my keyboard.'], m2: ['Theo', 'Started a pixel art dragon!'],
        ask: 'Theo, what colors are you using for the dragon?', share: 'I doodled a little robot in my notebook.',
        askReply: 'Mostly purple and gold. I can share it when it is done!', shareReply: 'Cute! You should post it here.' },
      tech: { name: 'Tech', initial: 'T', tint: '#DCE4FA', here: 4, topic: 'What app would you build?',
        m1: ['Raj', 'An app that tells me when my laundry is done.'], m2: ['Zoe', 'A bus tracker with zero ads.'],
        ask: 'Zoe, which bus do you take the most?', share: 'I would build an app that finds quiet places to study.',
        askReply: 'The 7. It is always late! Want to build it together?', shareReply: 'Ooh, I would use that. Let us brainstorm!' }
    };
    var cKey = s.circle || 'gaming';
    var cd = circleData[cKey];
    var breatheLeft = s.breatheSecondsLeft === undefined ? 60 : s.breatheSecondsLeft;
    var circleTints = {}, circleColors = {};
    Object.keys(CIRCLE_STYLE).forEach(function (k) { circleTints[k] = CIRCLE_STYLE[k].bg; circleColors[k] = CIRCLE_STYLE[k].color; });
    var gs = (s.groundStep === undefined || s.groundStep === null) ? null : s.groundStep;
    var drafts = {
      ask: cd.ask,
      share: cd.share,
      angry: "Zelda?? Seriously, that's the most overrated answer ever.",
      kind: "Ha, Zelda's not really my thing, but I'm curious what you love about it?"
    };
    var resetScroll = function () {
      window.scrollTo(0, 0);
      var sc = document.querySelector('.screen-transition');
      if (sc) sc.scrollTop = 0;
    };
    var go = function (sc, extra) {
      return function () { self.setState(Object.assign({ screen: sc, menuOpen: false, safetyNote: '', moOpen: false, evToast: '', dmDraft: '', pTyped: '' }, extra || {})); resetScroll(); };
    };
    var moLines = {
      low: 'Feeling drained is okay. Just reading the chat counts today.',
      okay: 'The Gaming circle is talking Zelda tonight. Want to peek?',
      full: 'Feeling energized! Maybe invite someone to Friday game night?'
    };
    var tab = function (name) {
      var map = { home: ['home'], circle: ['circles', 'circle'], me: ['me'] };
      return map[name].indexOf(screen) >= 0 ? 'var(--soft)' : 'transparent';
    };
    var pick = function (on) { return on ? 'var(--ink)' : '#FFFFFF'; };
    var pickFg = function (on) { return on ? '#FFFFFF' : 'var(--ink)'; };
    var isAngry = draft === 'angry';
    var sentKind = sent === 'kind' || sent === 'ask' || sent === 'share';
    var replies = {
      kind: "Ha, fair! It's the exploring for me. Want to play co-op on Friday?",
      ask: cd.askReply,
      share: cd.shareReply,
      angry: 'Oh. Okay.'
    };
    var choiceGood = pChoice === 'good';
    var pLevel = s.pLevel || 1;
    var pStarted = !!s.pStarted;
    var pStep = Math.max(0, Math.min(3, s.pStep || 0));
    var pBoundary = pChoice === 'boundary';
    var ciFeel = s.ciFeel || 'okay';
    var ciUp = s.ciUp || 'group';
    var ciHard = s.ciHard || 'meet';
    var ciHardSet = s.ciHard || '';
    var ciHardLine = ({ meet: "Meeting new people takes courage. I picked a practice for that.", close: "Staying close matters. Let's practice reaching out to someone you know.", tricky: "Tricky moments get easier with practice. I've got one ready.", work: "Let's practice talking at work or school today.", start: "Starting chats is tough. I picked today's practice just for that.", read: "Reading the room can be tricky. Let's work on that today.", tone: "Reading the room can be tricky. Let's work on that today.", reply: "Knowing what to reply is hard. I've got a scenario ready for you.", keep: "Knowing what to reply is hard. I've got a scenario ready for you." })[ciHardSet] || '';
    var hardFirst = ({ start: 'joinin', read: 'onread', tone: 'onread', reply: 'onread', keep: 'onread' })[ciHardSet] || '';
    var cFilter = s.cFilter || 'foryou';
    var readOnly = !!s.readOnly;
    var scripts = {
      joinin: { title: 'Join a chat that is already going', group: 'Starting chats', partner: 'Lee',
        scene: 'Lee and Maya are already mid-conversation.',
        opener: "...and that's why the Water Temple is the worst level ever.", hint: 'react to what they said, then add your take.',
        good: 'Haha, I get that! Can I jump in? I actually liked it, the music was so good.', vague: 'what are you guys talking about',
        goodReply: 'Of course! Okay, the music IS amazing. What else do you play?', vagueReply: 'Zelda. Do you play it?',
        starGood: 'You reacted to their topic before adding yours, so it felt natural.', starVague: 'You jumped in, which is the hardest part.',
        sparkGood: 'Ask a question back to keep it going.', sparkVague: 'Read the last few messages first, then join on their topic.' },
      onread: { title: 'They left you on read', group: 'Keeping it going', partner: 'Jordan',
        scene: 'You texted Jordan 2 days ago. No reply. Now Jordan posts in the group.',
        opener: 'Anyone up for co-op tonight?', hint: 'assume the best, keep it light, and don\'t blame.',
        good: "I'm in! And no worries about my message, reply whenever.", vague: 'oh so now you can type?',
        goodReply: "Oh no, sorry I forgot to reply! Yes, let's play tonight!", vagueReply: 'Uh... sorry, I was busy.',
        starGood: 'You assumed the best and kept it light, so Jordan felt safe to apologize.', starVague: 'You were honest about how it felt.',
        sparkGood: 'You can also ask "Want to pick up where we left off?"', sparkVague: 'Try a light tone first. People usually forget, not ignore.' },
      cancel: { title: 'A friend cancels last minute', group: 'When plans change', partner: 'Maya',
        scene: 'You and Maya planned to meet at game night in an hour.',
        opener: "Hey, so sorry, I can't make it tonight anymore.", hint: 'say how you feel kindly, then suggest another time.',
        good: "That's okay. I was looking forward to it, though! Want to try Sunday?", vague: 'whatever. you always do this.',
        goodReply: 'Yes, Sunday works! Thanks for being so nice about it.', vagueReply: "That's not fair, I said sorry.",
        starGood: 'You were honest about feeling let down and still kept it warm.', starVague: 'You said how you felt. That is a start.',
        sparkGood: 'Suggesting a new time shows you still want to hang out.', sparkVague: 'Swap "always" for how you feel right now, like "I was looking forward to it".' },
      leave: { title: 'Leave when your energy runs out', group: 'Saying no', partner: 'Maya',
        scene: "You're at game night and starting to feel overwhelmed.",
        opener: 'Want to play one more round?', hint: 'thank them, say you are tired, then say goodbye.',
        good: "I had fun, but I'm running low on energy. Heading home. See you next week!", vague: 'i have to go',
        goodReply: 'Totally get it! Thanks for coming. See you next week!', vagueReply: 'Oh... okay. Bye?',
        starGood: 'You left kindly and honestly, so Maya knows you had fun.', starVague: 'You took care of yourself. That matters.',
        sparkGood: 'You never have to explain more than you want to.', sparkVague: 'Add "I had fun" so they know it is not about them.' },
      repair: { title: 'Fix it after saying something harsh', group: 'Reading tone', partner: 'Jordan',
        scene: 'Yesterday you joked that Zelda is overrated. Jordan messages you.',
        opener: 'Hey, that comment about Zelda kind of stung.', hint: 'own it, say sorry, and show you care.',
        good: "You're right, that came out harsh. I'm sorry. I like hearing what you're into.", vague: 'it was just a joke, chill',
        goodReply: 'Thanks for saying that. Want to play co-op this weekend?', vagueReply: "Okay... it didn't feel like a joke.",
        starGood: 'You owned it without excuses. That builds trust.', starVague: 'You replied instead of ignoring it.',
        sparkGood: 'A small follow-up, like inviting them to play, helps too.', sparkVague: 'Start with "You\'re right" or "I\'m sorry", then explain if you want.' },
      catchup: { title: 'Catch up with a friend', group: 'People I know', partner: 'Alex', scene: "You haven't talked to Alex in a month.", opener: '', hint: 'say hi, mention something you remember about them, ask a question.', good: "Hey! It's been a while. How did your art class go?", vague: 'hey', goodReply: "Omg you remembered! It was great, I'll show you what I made.", vagueReply: 'hey whats up', starGood: 'You showed you remember them. That feels good to receive.', starVague: 'You reached out first. That is the hardest part.', sparkGood: 'Suggest a time to hang out if you want.', sparkVague: 'Add one thing you remember about them.' },
      misunderstand: { title: 'Fix a misunderstanding', group: 'People I know', partner: 'Mom', scene: 'Mom thought you were upset because you went quiet at dinner.', opener: 'Are you mad at me? You were so quiet.', hint: 'say what was really going on, kindly.', good: "I'm not mad. I was just tired and needed quiet. Thanks for checking.", vague: 'im fine', goodReply: "Oh okay, thank you for telling me. Rest up.", vagueReply: "You don't sound fine...", starGood: 'You explained instead of leaving them guessing.', starVague: 'You answered, which keeps the door open.', sparkGood: 'Saying what you need next time helps too.', sparkVague: 'Say one sentence about what was really going on.' },
      roommate: { title: 'Ask a roommate about something', group: 'People I know', partner: 'Alex', scene: 'Dishes keep piling up in the sink.', opener: '', hint: 'be friendly, say the problem, suggest a fix.', good: 'Hey, the dishes have been piling up. Want to take turns? I can do Mon/Wed/Fri.', vague: 'can u do ur dishes', goodReply: "Yeah sorry! That works, I'll take the other days.", vagueReply: 'they arent all mine...', starGood: 'You suggested a fix, not blame.', starVague: 'You spoke up about something that bothered you.', sparkGood: 'Thank them when they do it.', sparkVague: 'Try suggesting a plan instead of a demand.' },
      askboss: { title: 'Ask your boss or teacher for help', group: 'People I know', partner: 'Jen', scene: "You don't understand a new task at work.", opener: '', hint: 'say what you understand, then ask one clear question.', good: "Hi Jen, I started the inventory sheet. Can you show me how to count the back shelf?", vague: 'i dont get it', goodReply: "Of course! Come find me at 2 and I'll walk you through it.", vagueReply: 'Which part?', starGood: 'A clear question gets a clear answer.', starVague: 'Asking for help is a strength.', sparkGood: 'Say thanks after they help.', sparkVague: 'Name the exact part you are stuck on.' },
      boundary: { title: 'When something feels wrong', group: 'Real situations', partner: 'Alex',
        scene: 'Someone in your circle sends a message that feels off.',
        opener: "Hey, can you keep this between us? I just need $20 for a gift card.", hint: 'be clear and calm, say no, and tell someone you trust.',
        good: "I'm not comfortable with that, so my answer is no. I'm going to talk to someone I trust.", vague: 'uh ok maybe, how much',
        goodReply: "Okay... never mind then.", vagueReply: 'Great, just send it and do not tell anyone.',
        starGood: 'You said no clearly and chose to tell someone. That keeps you safe.', starVague: 'You replied, but staying open to the ask can keep the pressure going.',
        sparkGood: 'You can stop replying, report them, or block them at any time.', sparkVague: 'You never have to answer. Saying "no" and telling someone you trust is a strong move.' },
      invite: { title: 'Ask someone to hang out', group: 'Making plans', partner: 'Jordan',
        scene: 'You and Jordan clicked in the Gaming circle.',
        opener: 'Hey Sam! That Zelda chat was fun.', hint: 'say what and when, and give an easy out.',
        good: 'Want to come to game night Friday at 7? No pressure!', vague: 'u should come sometime i guess',
        goodReply: 'Yes! I would love that. Should I bring my Switch?', vagueReply: 'Um, sure? When is it?',
        starGood: 'You said what and when, and "no pressure" made it easy to say yes.', starVague: 'You reached out. That is the hardest part.',
        sparkGood: 'Next time, ask what game Jordan wants to play. People love being asked.', sparkVague: 'Add a day and time, like "Friday at 7", so Jordan knows the plan.' },
      disagree: { title: 'Disagree without hurting', group: 'Disagreeing', partner: 'Jordan',
        scene: 'Jordan shares a strong opinion in the circle.',
        opener: 'Zelda is the best game ever made. No contest.', hint: 'say something kind first, then share your opinion.',
        good: "Ha, I see why you love it! I'm more into Minecraft, though.", vague: 'no its not lol',
        goodReply: 'Fair! Minecraft is great too. What do you like to build?', vagueReply: 'Oh. Okay then.',
        starGood: 'You disagreed and still made Jordan feel good about his opinion.', starVague: 'You shared your honest opinion.',
        sparkGood: 'Ask a question back to keep the chat going.', sparkVague: 'Start with something kind, like "I see why you like it", then share yours.' }
    };
    var hardMap = { meet: ['joinin', 'invite'], close: ['catchup', 'misunderstand'], tricky: ['disagree', 'repair'], work: ['askboss', 'roommate'], start: ['joinin', 'invite'], keep: ['onread', 'joinin'], tone: ['repair', 'onread'], disagree: ['disagree', 'repair'], leave: ['leave', 'cancel'] };
    var ciHardKey = hardMap[ciHard] ? ciHard : (({ read: 'tone', reply: 'keep' })[ciHard] || 'meet');
    var upMap = { group: ['joinin', 'leave'], text: ['onread', 'invite'], hard: ['repair', 'disagree'], none: [] };
    var whyHard = { meet: 'meeting new people', close: 'staying close to people I know', tricky: 'handling tricky moments', work: 'talking at work or school', start: 'starting a chat', keep: 'keeping a chat going', tone: 'reading tone', disagree: 'disagreeing', leave: 'leaving or saying no' };
    var feelLabels = { over: 'Overwhelmed', okay: 'Okay', ready: 'Ready to connect' };
    var upLabels = { group: 'A group hangout', text: 'Texting someone new', hard: 'A hard conversation', none: 'Nothing planned' };
    var recCount = ciFeel === 'over' ? 1 : (ciFeel === 'ready' ? 3 : 2);
    var recLevel = ciFeel === 'ready' ? 2 : 1;
    var recKeys = [];
    hardMap[ciHardKey].concat(upMap[ciUp]).forEach(function (k) { if (recKeys.indexOf(k) < 0) recKeys.push(k); });
    if (hardFirst) recKeys = [hardFirst].concat(recKeys.filter(function (k) { return k !== hardFirst; }));
    var peopleKeys = ['catchup', 'misunderstand', 'roommate', 'askboss'];
    var goalsArr = Array.isArray(s.goals) ? s.goals : [];
    var defaultPlan = goalsArr.indexOf('close') >= 0 ? ['Say hi to Alex', 'Call Mom this weekend', 'Try one new conversation starter']
      : goalsArr.indexOf('work') >= 0 ? ['Ask Jen one question at work', 'Say good morning to a coworker', 'Try one new conversation starter']
      : ["Reply to Jordan's message", 'Join the Gaming circle Thursday', 'Try one new conversation starter'];
    var peopleFirst = goalsArr.indexOf('close') >= 0 || goalsArr.indexOf('work') >= 0;
    if (peopleFirst) recKeys = peopleKeys.concat(recKeys.filter(function (k) { return peopleKeys.indexOf(k) < 0; }));
    recKeys = recKeys.slice(0, recCount);
    var pScen = s.pScen || recKeys[0];
    var ps = scripts[pScen];
    // ----- Level 3: user types their own reply (rule-based check until the AI API is connected) -----
    var pTyped = s.pTyped || '';
    var pOwn = s.pOwn || '';
    var pHintUsed = !!s.pHintUsed;
    var evalOwn = function (t) {
      var low = t.toLowerCase();
      var harshList = ['whatever', 'stupid', 'shut up', 'annoying', 'hate', 'overrated', 'dumb', 'seriously', 'always', 'never mind'];
      var harsh = harshList.filter(function (w) { return low.indexOf(w) >= 0; })[0] || '';
      var words = t.trim() ? t.trim().split(/\s+/).length : 0;
      var asks = t.indexOf('?') >= 0;
      var kind = /(thank|sorry|no worries|i get|fair|had fun|see you|no pressure|that's okay|that is okay|love|cool|nice|haha|i see)/.test(low);
      return { harsh: harsh, words: words, asks: asks, kind: kind, good: !harsh && words >= 4 && (asks || kind) };
    };
    var ownEv = evalOwn(pOwn);
    var typedEv = evalOwn(pTyped);
    var barCur = (screen === 'dm' ? dmDraft : pTyped) || '';
    var setBar = function (val) {
      if (screen === 'dm') self.setState({ dmDraft: val, dmGentle: false, ideasOpen: val.trim() ? s.ideasOpen !== false : (moHelp === 'lots' ? true : s.ideasOpen !== false) });
      else self.setState({ pTyped: val });
    };
    var kbShift = s.kbShift || 'off';
    var barSend = function () {
      var sentOk = false;
      if (screen === 'dm') {
        if (dmDraft.trim() && !dmHarsh) { sendDm(); sentOk = true; }
      } else if (pTyped.trim()) {
        var tt = pTyped.trim();
        // Tapping a suggestion fills the box; sending it unchanged keeps the guided feedback
        if (tt === '"' + ps.good + '"' || tt === ps.good) self.setState({ pChoice: 'good', pTyped: '' });
        else if (tt === ps.vague) self.setState({ pChoice: 'vague', pTyped: '' });
        else self.setState({ pOwn: tt, pChoice: 'own', pTyped: '' });
        sentOk = true;
      }
      if (sentOk) {
        if (navigator.vibrate) navigator.vibrate(10);
        setTimeout(function () { var end = document.getElementById('dm-end'); if (end) end.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 60);
      }
    };
    if (pChoice === 'own') choiceGood = ownEv.good;
    var levelNames = ['Level 1 · Guided', 'Level 2 · Light help', 'Level 3 · On your own'];
    var scenItem = function (k) {
      var on = k === pScen;
      var iconMap = { catchup: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z', misunderstand: 'M4 5h16v12H9l-5 4V5ZM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .7-1 1.2M12 15.5v.01', roommate: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6', askboss: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .7-1 1.2M12 16.5v.01', boundary: 'M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z', joinin: 'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 21c.5-4 2.2-6 5-6M14 15c4 0 6.5 2 7 6', onread: 'M4 5h16v12H9l-5 4V5ZM8 10h8', cancel: 'M4 5h16v15H4zM8 3v4M16 3v4M7 13l10 0', leave: 'M10 4H5v16h5M15 8l4 4-4 4M19 12H9', repair: 'M4 5h16v12H9l-5 4V5Zm5 7 2 2 4-5', invite: 'M12 5v14M5 12h14', disagree: 'M5 7h14M5 12h10M5 17h7' };
      return { title: scripts[k].title, group: scripts[k].group, icon: iconMap[k], bg: on ? 'var(--ink)' : '#FFFFFF', fg: on ? '#FFFFFF' : 'var(--ink)',
        pick: function () { self.setState({ pScen: k }); } };
    };
    var recScenarios = recKeys.map(function (k, i) { var o = scenItem(k); o.picked = !!hardFirst && i === 0; return o; });
    var moreScenarios = Object.keys(scripts).filter(function (k) { return recKeys.indexOf(k) < 0; }).map(scenItem);
    var recList = recKeys.map(function (k) {
      var fromHard = hardMap[ciHardKey].indexOf(k) >= 0;
      var fromPeople = peopleFirst && peopleKeys.indexOf(k) >= 0;
      return { title: scripts[k].title, level: 'Level ' + recLevel,
        why: (fromPeople || fromHard) ? 'Because you want help with ' + whyHard[ciHardKey] : 'For your ' + upLabels[ciUp].toLowerCase().replace('a ', '') + ' coming up',
        start: function () { self.setState({ screen: 'practice', pScen: k, pLevel: recLevel, pStarted: true, pChoice: '', moOpen: false }); } };
    });
    var upNextText = ciUp === 'group'
      ? "Warm up for tonight's Gaming chat"
      : (ciUp === 'none' ? 'Practice one small conversation step' : 'Warm up for ' + upLabels[ciUp].toLowerCase());
    var ciStep = Math.max(0, Math.min(2, s.ciStep || 0));
    var ciChips = function (opts, key, next) {
      return Object.keys(opts).map(function (k) {
        return { label: opts[k], on: s[key] === k,
          pick: function () {
            var o = {}; o[key] = k; if (key === 'ciHard') o.goals = [k];
            if (next === 'home') {
              self.setState(o);
              setTimeout(function () { self.setState({ screen: 'home', ciStep: 0, homeFull: false, menuOpen: false, moOpen: false }); resetScroll(); }, 400);
            } else { self.setState(o); setTimeout(function () { self.setState({ ciStep: next }); resetScroll(); }, 400); }
          } };
      });
    };
    var chip = function (opts, cur, key) {
      return Object.keys(opts).map(function (k) {
        var on = k === cur; var o = {};
        o[key] = k;
        return { label: opts[k], on: on, bg: on ? 'var(--ink)' : '#FFFFFF', fg: on ? '#FFFFFF' : 'var(--ink)',
          pick: function () { self.setState(o); } };
      });
    };
    var levelList = [['Level 1', 'Guided'], ['Level 2', 'Light help'], ['Level 3', 'On your own']].map(function (l, i) {
      var on = pLevel === i + 1;
      return { name: l[0], desc: l[1], bg: on ? 'var(--ink)' : '#FFFFFF', fg: on ? '#FFFFFF' : 'var(--ink)',
        pick: function () { self.setState({ pLevel: i + 1, pTyped: '', pOwn: '', pHintUsed: false }); } };
    });

    // ---------- Events ----------
    var evIdeas = {
      gaming: ['Co-op game night', 'Speedrun watch party'], music: ['Playlist swap', 'Open mic night'],
      anime: ['Watch party', 'Fan art hour'], cooking: ['Cook-along', 'Snack swap'],
      art: ['Sketch and chill', 'Museum visit'], tech: ['Build night', 'Hack and snack'],
      outside: ['Coffee meetup', 'Walk in the park', 'Movie night']
    };
    var baseEvents = [
      { id: 'e1', circle: 'gaming', title: 'Co-op game night', when: 'Fri · 7 PM', where: 'Online · voice chat', tag: 'Voice optional', going: 4,
        size: 'Up to 6 people', sound: 'Voice chat, no music', light: 'Online · camera off is fine', exit: 'Leave the call anytime',
        people: ['Jordan', 'Lee', 'Maya', 'Kai'], prep: 'joinin' },
      { id: 'e2', circle: 'art', title: 'Sketch and chill', when: 'Sat · 2 PM', where: 'In person · Tempe library', tag: 'Quiet-friendly', going: 3,
        size: '3–5 people', sound: 'Quiet, no music', light: 'Soft daylight', exit: 'Quiet corner nearby',
        people: ['Mia', 'Theo', 'Rosa'], prep: 'joinin' },
      { id: 'e3', circle: null, title: 'Coffee with Jordan and Maya', when: 'Sun · 11 AM', where: 'In person · café', tag: 'Small group', going: 2,
        size: '3 people', sound: 'Soft background music', light: 'Bright, big windows', exit: 'Patio seats if it gets loud',
        people: ['Jordan', 'Maya'], prep: 'leave' },
      { id: 'e4', circle: 'music', title: 'Playlist swap', when: 'Thu · 6 PM', where: 'Online · text only', tag: 'Text only', going: 6,
        size: 'About 8 people', sound: 'Text only, no voice', light: 'Online · no camera', exit: 'Leave the chat anytime',
        people: ['Lee', 'Priya', 'Zoe'], prep: 'onread' }
    ];
    var pastEvent = { id: 'e0', circle: 'gaming', title: 'Minecraft build night', when: 'Yesterday · 7 PM', where: 'Online · voice chat', tag: 'Voice optional', going: 4,
      size: 'Up to 6 people', sound: 'Voice chat, no music', light: 'Online · camera off is fine', exit: 'Leave the call anytime',
      people: ['Jordan', 'Lee', 'Kai'], prep: 'joinin', past: true };
    var events = s.events || baseEvents;
    var rsvp = s.rsvp || { e3: 'going' };
    var evCard = function (e) {
      var c = e.circle ? circleData[e.circle] : null;
      var g = rsvp[e.id] === 'going';
      var cardDates = { e0: ['SUN','2'], e1: ['FRI','7'], e2: ['SAT','8'], e3: ['SUN','9'], e4: ['THU','6'] };
      var cardDate = e.dateDay ? [e.dateDay, e.dateNum] : (cardDates[e.id] || ['SUN','9']);
      return { title: e.title, when: e.when, where: e.where, tag: e.tag, meta: (e.duration || '1 hr') + ' · ' + Math.max(1, e.going || 0) + ((e.going || 0) > 1 ? ' people' : ' person'),
        hostLabel: c ? c.name + ' circle' : 'Outside circles · friends',
        tint: c ? c.tint : '#E4F1F0', icon: e.circle || 'gaming', day: cardDate[0], date: cardDate[1],
        goingText: (e.going + (g ? 1 : 0)) + ' going',
        isMine: !!e.mine, notMine: !e.mine,
        inLabel: g ? 'Going ✓' : "I'm in", inBg: g ? 'var(--ink)' : 'var(--soft)', inFg: g ? '#FFFFFF' : 'var(--ink)',
        toggle: function () { var r = Object.assign({}, rsvp); r[e.id] = g ? '' : 'going'; changeWithUndo({ rsvp: r }, g ? 'RSVP removed' : "You're going ✓", { rsvp: rsvp }); },
        sense: [e.size, e.sound, e.light].filter(Boolean),
        open: function () { self.setState({ screen: 'event', evId: e.id, evBackTo: screen, moOpen: false, evToast: '' }); } };
    };
    var homeEvents = events.filter(function (e) { return e.mine || rsvp[e.id] === 'going'; }).map(evCard);
    var circleEvents = events.filter(function (e) { return e.circle === cKey; }).map(evCard);
    var evFrom = s.evFrom || 'home';
    var evHost = s.evHost || 'outside';
    var evIsOutside = evHost === 'outside';
    var evStep = s.evStep || 1;
    var whatOpts = evIdeas[evHost];
    var evWhat = whatOpts.indexOf(s.evWhat) >= 0 ? s.evWhat : whatOpts[0];
    var weekDays = [['MON','3'],['TUE','4'],['WED','5'],['THU','6'],['FRI','7'],['SAT','8'],['SUN','9']];
    var evDate = s.evDate || 'SAT 8';
    var evTime = s.evTime || '2:00 PM';
    var evDuration = s.evDuration || '1 hr';
    var endTimes = { '10:00 AM': {'30 min':'10:30 AM','1 hr':'11:00 AM','2 hr':'12:00 PM'}, '11:00 AM': {'30 min':'11:30 AM','1 hr':'12:00 PM','2 hr':'1:00 PM'}, '2:00 PM': {'30 min':'2:30 PM','1 hr':'3:00 PM','2 hr':'4:00 PM'}, '6:00 PM': {'30 min':'6:30 PM','1 hr':'7:00 PM','2 hr':'8:00 PM'}, '7:00 PM': {'30 min':'7:30 PM','1 hr':'8:00 PM','2 hr':'9:00 PM'} };
    var evEnd = endTimes[evTime][evDuration];
    var evMode = s.evMode || 'In person';
    var venues = [
      { name: 'Cartel Coffee Lab', address: '225 W University Dr, Tempe', distance: '0.8 mi', quiet: 'Usually quiet' },
      { name: 'Tempe Public Library', address: '3500 S Rural Rd', distance: '1.4 mi', quiet: 'Quiet zone' },
      { name: 'Kiwanis Park', address: '5500 S Mill Ave', distance: '2.1 mi', quiet: 'Outdoors, open space' }
    ];
    var evVenueName = s.evVenue || venues[0].name;
    var evVenue = venues.filter(function (x) { return x.name === evVenueName; })[0] || venues[0];
    var evOnline = s.evOnline || 'Voice chat';
    var evWhere = evMode === 'In person' ? 'In person · ' + evVenue.name : 'Online · ' + evOnline.toLowerCase();
    var evWhen = evDate.split(' ')[0][0] + evDate.split(' ')[0].slice(1).toLowerCase() + ' · ' + evTime.replace(':00','');
    // Same day and start time as a plan you already have?
    var planDates = { e0: 'SUN 2', e1: 'FRI 7', e2: 'SAT 8', e3: 'SUN 9', e4: 'THU 6' };
    var evClash = events.filter(function (e) {
      if (!(e.mine || rsvp[e.id] === 'going')) return false;
      var d = e.dateDay ? e.dateDay + ' ' + e.dateNum : planDates[e.id];
      var st = (e.start || (e.when || '').split(' · ')[1] || '').replace(':00', '');
      return d === evDate && st === evTime.replace(':00', '');
    })[0];
    var sizeOpts = ['2–4 people', '5–8 people'];
    var evSize = s.evSize || sizeOpts[0];
    var evGroupSize = s.evGroupSize || 4;
    var evInvite = s.evInvite || ['Jordan'];
    var evShare = s.evShare === undefined ? true : s.evShare;
    var evInPerson = evMode === 'In person';
    var soundOpts = ['Quiet', 'Soft music', 'Loud music'];
    var evSound = soundOpts.indexOf(s.evSound) >= 0 ? s.evSound : soundOpts[0];
    var lightOpts = ['Soft', 'Bright', 'Dim'];
    var evLight = lightOpts.indexOf(s.evLight) >= 0 ? s.evLight : lightOpts[0];
    var evRemind = s.evRemind || '1 hour before';
    var pickList = function (list, cur, key) {
      return list.map(function (val) {
        var on = val === cur; var o = {}; o[key] = val;
        return { label: val, on: on, bg: on ? 'var(--ink)' : '#FFFFFF', fg: on ? '#FFFFFF' : 'var(--ink)',
          pick: function () { self.setState(o); } };
      });
    };
    var hostOpts = ['outside'].concat(Object.keys(circleData)).map(function (k) {
      var on = k === evHost;
      return { label: k === 'outside' ? 'Outside circles' : circleData[k].name, on: on,
        bg: on ? 'var(--ink)' : '#FFFFFF', fg: on ? '#FFFFFF' : 'var(--ink)',
        pick: function () { self.setState({ evHost: k }); } };
    });
    var inviteOpts = ['Jordan', 'Maya', 'Priya', 'Kai'].map(function (n) {
      var on = evInvite.indexOf(n) >= 0;
      return { label: n, on: on, bg: on ? 'var(--ink)' : '#FFFFFF', fg: on ? '#FFFFFF' : 'var(--ink)',
        pick: function () { self.setState({ evInvite: on ? evInvite.filter(function (x) { return x !== n; }) : evInvite.concat([n]) }); } };
    });
    var startEvent = function (from, host) {
      return function () { self.setState({ screen: 'newEvent', evFrom: from, evHost: host, evStep: 1, evWhat: '', evDate: 'SAT 8', evTime: '2:00 PM', evDuration: '1 hr', evMode: 'In person', evVenue: venues[0].name, evOnline: 'Voice chat', evGroupSize: 4, evRemind: '1 hour before', evSize: '', evSound: 'Quiet', evLight: 'Soft', evInvite: ['Jordan'], evShare: true, moOpen: false, menuOpen: false, evToast: '' }); };
    };
    var createEvent = function () {
      var ne = { id: 'n' + Date.now(), circle: evIsOutside ? null : evHost, title: evWhat, when: evWhen, where: evWhere,
        tag: evIsOutside ? 'With ' + evInvite.join(', ') : (evSize === sizeOpts[0] ? 'Small group' : 'Medium group'), going: 0, mine: true,
        size: evIsOutside ? (evInvite.length + 1) + ' people' : 'Up to ' + evGroupSize + ' people', sound: evSound, light: evLight,
        dateDay: evDate.split(' ')[0], dateNum: evDate.split(' ')[1], start: evTime, end: evEnd, duration: evDuration,
        venue: evInPerson ? evVenue.name : '', address: evInPerson ? evVenue.address : '', remind: evRemind, mode: evMode,
        exit: evInPerson ? 'Leave anytime' : 'Leave the chat anytime', people: evIsOutside ? evInvite.slice() : [],
        prep: evInPerson ? 'leave' : 'joinin' };
      var r = Object.assign({}, rsvp); r[ne.id] = 'going';
      var toCircle = evFrom === 'circle' && !evIsOutside;
      changeWithUndo({ events: [ne].concat(events), rsvp: r, screen: toCircle ? 'circle' : 'home', circle: evIsOutside ? cKey : evHost,
        evToast: evIsOutside ? 'Invites sent to ' + evInvite.join(', ') + '. Mo will remind you an hour before.' : 'Your event is posted in ' + circleData[evHost].name + '. Mo will remind you an hour before.' },
        'Event created', { events: events, rsvp: rsvp, screen: 'newEvent', circle: cKey, evToast: '' });
    };
    var evVals = {
      isNewEvent: screen === 'newEvent',
      homeEvents: homeEvents, hasPlans: homeEvents.length > 0, noPlans: homeEvents.length === 0,
      circleEvents: circleEvents, hasCircleEvents: circleEvents.length > 0, noCircleEvents: circleEvents.length === 0,
      evToast: s.evToast || '', hasEvToast: !!s.evToast,
      newEventHome: startEvent('home', 'outside'),
      newEventCircle: startEvent('circle', cKey),
      evBack: go(evFrom === 'circle' ? 'circle' : 'home'),
      evTitle: evIsOutside ? 'Plan something with friends' : 'Plan an event in ' + circleData[evHost].name,
      evStep: evStep, evStepLabel: 'Step ' + evStep + ' of 3',
      evNext: function () { self.setState({ evStep: Math.min(3, evStep + 1) }); },
      evPrev: function () { if (evStep > 1) self.setState({ evStep: evStep - 1 }); else evVals.evBack(); },
      setEvWhat: function (e) { self.setState({ evWhat: e.target.value }); },
      showCalendar: !!s.showCalendar,
      toggleCalendar: function () { self.setState({ showCalendar: !s.showCalendar }); },
      hostOpts: hostOpts, whatOpts: pickList(whatOpts, evWhat, 'evWhat'), sizeOpts: pickList(sizeOpts, evSize, 'evSize'),
      inviteOpts: inviteOpts, evIsOutside: evIsOutside, evInCircle: !evIsOutside,
      evInPerson: evInPerson,
      soundOpts: pickList(soundOpts, evSound, 'evSound'), lightOpts: pickList(lightOpts, evLight, 'evLight'),
      weekDays: weekDays.map(function (d) { var val = d[0] + ' ' + d[1]; return { day: d[0], date: d[1], on: evDate === val, pick: function () { self.setState({ evDate: val }); } }; }),
      timeOpts: pickList(['10:00 AM','11:00 AM','2:00 PM','6:00 PM','7:00 PM'], evTime, 'evTime'),
      durationOpts: pickList(['30 min','1 hr','2 hr'], evDuration, 'evDuration'),
      evClash: evClash ? 'You already have “' + evClash.title + '” then. Pick another time?' : '', hasClash: !!evClash,
      evTimeRange: evTime + ' – ' + evEnd + ' · ' + evDuration,
      modeOpts: pickList(['In person','Online'], evMode, 'evMode'),
      venueOpts: venues.map(function (venue) { return Object.assign({}, venue, { on: venue.name === evVenue.name, pick: function () { self.setState({ evVenue: venue.name }); } }); }),
      onlineOpts: pickList(['Voice chat','Video call','Text only'], evOnline, 'evOnline'),
      evVenue: evVenue,
      evGroupSize: evGroupSize,
      groupDown: function () { self.setState({ evGroupSize: Math.max(2, evGroupSize - 1) }); },
      groupUp: function () { self.setState({ evGroupSize: Math.min(8, evGroupSize + 1) }); },
      remindOpts: pickList(['1 hour before','1 day before','Both'], evRemind, 'evRemind'),
      shareLabel: evShare ? trusted + ' will know where I am ✓' : 'Tell ' + trusted + ' where I will be',
      shareBg: evShare ? 'var(--ink)' : '#FFFFFF', shareFg: evShare ? '#FFFFFF' : 'var(--ink)',
      toggleShare: function () { self.setState({ evShare: !evShare }); },
      evTip: evInPerson ? 'Meeting in person? Pick a public place and keep it short the first time. You can leave anytime.'
        : (evWhere.indexOf('text') >= 0 ? 'Text only is a low-pressure start. People can join without talking out loud.' : 'Voice is optional. People can just listen and type if they want.'),
      evPreview: evWhat + ' · ' + evWhen,
      evPreviewSize: evDuration + ' · ' + (evIsOutside ? (evInvite.length + 1) + ' people' : 'Up to ' + evGroupSize + ' people'),
      evPreviewSense: evSound + ' · ' + evLight,
      evPreviewWhere: evWhere + (evIsOutside ? ' · with ' + (evInvite.length ? evInvite.join(', ') : 'nobody yet') : ' · ' + evSize),
      canCreate: !evIsOutside || evInvite.length > 0,
      createBg: (!evIsOutside || evInvite.length > 0) ? 'var(--ink)' : '#B7C2BA',
      createEvent: function () { if (!evIsOutside || evInvite.length > 0) createEvent(); }
    };

    // ---------- Profile ----------
    var pFirst = s.pFirst === undefined ? 'Sam' : s.pFirst;
    var pLast = s.pLast === undefined ? 'Rivera' : s.pLast;
    var pEmail = s.pEmail === undefined ? 'sam.rivera@email.com' : s.pEmail;
    var pGender = s.pGender || 'Man';
    var genderList = ['Woman', 'Man', 'Non-binary', 'Prefer to self-describe', 'Prefer not to say'];
    var profVals = {
      firstName: pFirst || 'there', pFirst: pFirst, pLast: pLast, pEmail: pEmail, pGender: pGender,
      fullName: (pFirst + ' ' + pLast).trim() || 'Your name',
      initials: ((pFirst[0] || '') + (pLast[0] || '')).toUpperCase() || '?',
      hasPhoto: !!s.pPhoto, noPhoto: !s.pPhoto, pPhoto: s.pPhoto || '',
      profEdit: !!s.profEdit, profView: !s.profEdit,
      editProfile: function () { self.setState({ profEdit: true }); },
      saveProfile: function () { self.setState({ profEdit: false }); notify('Saved ✓'); },
      setFirst: function (e) { self.setState({ pFirst: e.target.value }); },
      setLast: function (e) { self.setState({ pLast: e.target.value }); },
      setEmail: function (e) { self.setState({ pEmail: e.target.value }); },
      pickPhoto: function (e) { var f = e.target.files && e.target.files[0]; if (f) saveQuietly({ pPhoto: URL.createObjectURL(f) }, 'Saved ✓'); },
      removePhoto: function () { changeWithUndo({ pPhoto: '' }, 'Photo removed', { pPhoto: s.pPhoto || '' }); },
      genderOpts: genderList.map(function (g) {
        var on = g === pGender;
        return { label: g, on: on, bg: on ? 'var(--ink)' : '#FFFFFF', fg: on ? '#FFFFFF' : 'var(--ink)',
          pick: function () { self.setState({ pGender: g }); } };
      })
    };

    // ---------- DMs ----------
    var cTab = s.cTab || 'circles';
    var dmData = {
      fam: { name: trusted, from: 'Your trusted person', known: true, tint: '#FBE1D8', msgs: [['them', 'Love you! Call me when you can.']],
        ideas: ['Hi! Just wanted to say hi.', 'Can I call you this weekend?', 'Guess what happened today!'], sets: [['Hi! Just wanted to say hi.', 'Can I call you this weekend?', 'Guess what happened today!'], ['Thinking of you!', 'How was your day?', 'I miss you.']], replies: ['Hi sweetie! So nice to hear from you.', 'Of course! Saturday works.', 'Tell me everything!'], reply: 'Aw, that made my day.' },
      alex: { name: 'Alex', from: 'Roommate', known: true, tint: '#E3E0F8', msgs: [['them', 'Haha that movie was wild.']],
        ideas: ['Want to watch another one this week?', 'How was your week?', 'I made too much pasta, want some?'], sets: [['Want to watch another one this week?', 'How was your week?', 'I made too much pasta, want some?'], ['What are you up to tonight?', 'Want to cook together?', 'How is your art class going?']], replies: ['Yes! Friday?', 'Busy but good! You?', 'Omg yes please.'], reply: 'Hey! Good to hear from you.' },
      jen: { name: 'Jen', from: 'Coworker', known: true, tint: '#D9EEE4', msgs: [['them', 'Thanks for helping with the shelves today!']],
        ideas: ['Happy to help!', 'Can you show me the inventory sheet tomorrow?', 'Have a good evening!'], sets: [['Happy to help!', 'Can you show me the inventory sheet tomorrow?', 'Have a good evening!'], ['See you tomorrow!', 'Want to grab lunch Friday?', 'Thanks for being patient with me.']], replies: ['You too!', 'Sure, come find me at 10.', 'You too, see you tomorrow!'], reply: 'Thanks! See you at work.' },
      jordan: { name: 'Jordan', from: 'Gaming circle', tint: '#F9DCE4',
        msgs: [['them', 'Hey! Still up for co-op on Friday?'], ['me', 'Yes! What time?'], ['them', '7 works? I can show you the Water Temple trick.']],
        ideas: ['7 works! See you then.', 'Can we do 8? I have dinner at 7.', 'Sounds great, what should I bring?'], sets: [['7 works! See you then.', 'Can we do 8? I have dinner at 7.', 'Sounds great, what should I bring?'], ['7 is perfect for me.', 'Can I bring a friend?', 'Show me the Water Temple trick!']], replies: ["Perfect, I'll send the invite!", '8 is fine! See you then.'], reply: 'Ha, fair! Tell me what you think.', unread: true },
      maya: { name: 'Maya', from: 'Gaming circle', tint: '#E3E0F8',
        msgs: [['them', 'Your island idea was so cute. Do you have a Switch?']],
        ideas: ['Yes! Want to visit my island?', 'Not yet, but I love watching people play.', 'What should I build first?'], sets: [['Yes! Want to visit my island?', 'Not yet, but I love watching people play.', 'What should I build first?'], ['I just got one! Any tips?', 'Your island idea sounds so cozy.', 'Want to trade fruit?']], replies: ['Yay! Send me your Dream Address when you can.', 'Same! Want to watch a stream together sometime?'], reply: 'Oh cool, tell me more!', unread: true },
      priya: { name: 'Priya', from: 'Music circle', tint: 'var(--tint)',
        msgs: [['me', 'Thanks for the playlist!'], ['them', 'Anytime! Which song did you like most?']],
        ideas: ['The second one was so calming.', 'Honestly, all of them!', 'Have you heard their new album?'], sets: [['The second one was so calming.', 'Honestly, all of them!', 'Have you heard their new album?'], ['Same! I listen while I study too.', 'What else are you into?', 'Want to swap playlists?']], replies: ['Same! I listen to it while studying.', 'Haha, good taste. I will make you another one!'], reply: 'Haha, fair enough!', unread: false }
    };
    var dmMsgs = s.dmMsgs || {};
    var dmRead = s.dmRead || {};
    var dmReqState = s.dmReq || 'pending';
    var msgsFor = function (k) { return dmMsgs[k] || dmData[k].msgs; };
    var dmKey = s.dm || 'jordan';
    var dmd = dmData[dmKey];
    var dmDraft = s.dmDraft || '';
    var dmIdeaSet = s.dmIdeaSet ? 1 : 0;
    var harshWords = ['whatever', 'stupid', 'shut up', 'annoying', 'hate', 'overrated', 'dumb'];
    var dmHarsh = harshWords.some(function (w) { return dmDraft.toLowerCase().indexOf(w) >= 0; });
    var harshWhy = { whatever: 'can sound like you do not care what they said', stupid: 'calls their idea bad, which can hurt', 'shut up': 'tells them to stop talking, which feels rude', annoying: 'can feel like you are criticizing them as a person', hate: 'is a very strong word, so it can feel like an attack', overrated: 'can sound like you are dismissing something they love', dumb: 'calls their idea bad, which can hurt' };
    var harshHit = harshWords.filter(function (w) { return dmDraft.toLowerCase().indexOf(w) >= 0; })[0] || '';
    var dmWhy = harshHit ? 'Why: "' + harshHit + '" ' + harshWhy[harshHit] + '.' : '';
    var openDm = function (k) {
      return function () {
        var r = Object.assign({}, dmRead); r[k] = true;
        var base = { dm: k, dmDraft: '', dmRead: r, moOpen: false, dmGentle: false, dmIdeaSet: 0, ideasOpen: moHelp === 'lots' };
        // First DM ever: offer a warm-up on the current screen instead of opening the chat
        if (!s.dmCount) self.setState(Object.assign(base, { showPracticeGate: true }));
        else self.setState(Object.assign(base, { screen: 'dm' }));
      };
    };
    var unreadCount = Object.keys(dmData).filter(function (k) { return dmData[k].unread && !dmRead[k]; }).length;
    var sendDm = function () {
      if (!dmDraft.trim()) return;
      var idx = dmd.ideas.indexOf(dmDraft); var replyText = idx >= 0 ? dmd.replies[idx] : dmd.reply;
      var list = msgsFor(dmKey).concat([['me', dmDraft]]);
      var m = Object.assign({}, dmMsgs); m[dmKey] = list;
      var sendToken = Date.now();
      changeWithUndo({ dmMsgs: m, dmDraft: '', dmGentle: false, ideasOpen: moHelp !== 'ask', dmSendToken: sendToken }, 'Sent to ' + dmd.name, { dmMsgs: dmMsgs, dmDraft: dmDraft, dmGentle: !!s.dmGentle, dmSendToken: 0, dmTyping: '' });
      // Show "typing…" dots before the reply arrives
      setTimeout(function () {
        if (self.state.dmSendToken === sendToken) self.setState({ dmTyping: dmKey });
      }, 500);
      setTimeout(function () {
        if (self.state.dmSendToken !== sendToken) return;
        var m2 = Object.assign({}, self.state.dmMsgs || {}); m2[dmKey] = (m2[dmKey] || list).concat([['them', replyText]]);
        self.setState({ dmMsgs: m2, dmTyping: '' });
      }, 2000);
    };
    var tabBtn = function (k, label) {
      var on = cTab === k;
      return { label: label, bg: on ? 'var(--ink)' : 'transparent', fg: on ? '#FFFFFF' : 'var(--ink)',
        pick: function () { self.setState({ cTab: k }); } };
    };
    var dmVals = {
      cTabs: [tabBtn('circles', 'Circles'), tabBtn('dms', unreadCount ? 'Messages · ' + unreadCount : 'Messages')],
      showCircleList: cTab === 'circles', showDmList: cTab === 'dms',
      dmList: Object.keys(dmData).map(function (k) {
        var d = dmData[k]; var l = msgsFor(k); var last = l[l.length - 1];
        var unread = d.unread && !dmRead[k];
        return { name: d.name, initial: d.name[0], tint: d.tint, from: d.from, ckey: d.from.split(' ')[0].toLowerCase(), iconBg: (CIRCLE_STYLE[d.from.split(' ')[0].toLowerCase()] || {}).bg, iconColor: (CIRCLE_STYLE[d.from.split(' ')[0].toLowerCase()] || {}).color,
          preview: (last[0] === 'me' ? 'You: ' : '') + last[1], unread: unread,
          weight: unread ? '600' : '400', open: openDm(k) };
      }),
      reqPendingDm: dmReqState === 'pending', reqDone: dmReqState !== 'pending',
      reqDoneText: dmReqState === 'reported' ? 'Reported and blocked. Alex can’t message you.' : 'Request deleted. Alex isn’t told.',
      reqReport: function () { changeWithUndo({ dmReq: 'reported' }, 'Blocked Alex', { dmReq: dmReqState }); },
      reqDelete: function () { changeWithUndo({ dmReq: 'deleted' }, 'Request deleted', { dmReq: dmReqState }); },
      isDm: screen === 'dm',
      dmTyping: s.dmTyping === dmKey,
      dmName: dmd.name, dmFrom: dmd.known ? dmd.from : 'Met in the ' + dmd.from, dmTint: dmd.tint, dmInitial: dmd.name[0],
      dmMessages: msgsFor(dmKey).map(function (m, index, list) {
        var me = m[0] === 'me';
        return { text: m[1], align: me ? 'flex-end' : 'flex-start', bg: me ? 'var(--ink)' : '#FFFFFF', fg: me ? '#FFFFFF' : 'var(--ink)',
          radius: me ? '24px 24px 8px 24px' : '24px 24px 24px 8px', me: me, showAvatar: !me && (index === 0 || list[index - 1][0] !== 'them'), lastInGroup: index === list.length - 1 || list[index + 1][0] !== m[0],
          time: index === list.length - 1 ? '7:42 PM' : '', seen: me && index === list.length - 1 };
      }),
      dmIdeas: dmd.sets[dmIdeaSet].map(function (t) { return { label: t, pick: function () { self.setState({ dmDraft: t, dmGentle: false, ideasOpen: false }); } }; }),
      showDmIdeas: s.ideasOpen !== false, showIdeaPill: moHelp !== 'lots' && s.ideasOpen === false, noShimmer: moHelp === 'ask',
      openIdeas: function () { self.setState({ ideasOpen: true }); },
      moreIdeas: function () { self.setState({ dmIdeaSet: dmIdeaSet ? 0 : 1 }); },
      dmDraft: dmDraft,
      setDmDraft: function (e) { self.setState({ dmDraft: e.target.value, dmGentle: false, ideasOpen: e.target.value.trim() ? s.ideasOpen !== false : (moHelp === 'lots' ? true : s.ideasOpen !== false) }); },
      dmKey: function (e) { if (e.key === 'Enter' && !dmHarsh) sendDm(); },
      dmHarsh: dmHarsh, dmNotHarsh: !dmHarsh, dmWhy: dmWhy,
      dmSayGently: function () { self.setState({ dmDraft: "Hmm, I'm not sure I agree. Can you tell me more?", dmGentle: true }); },
      dmSendAnyway: sendDm,
      sendDm: function () { if (!dmHarsh) sendDm(); },
      dmSendBg: dmDraft.trim() && !dmHarsh ? 'var(--ink)' : '#C5CEC7',
      dmBack: function () { self.setState({ screen: 'circles', cTab: 'dms', moOpen: false }); },
      dmJordan: openDm('jordan'), dmMaya: openDm('maya'),
      m1CanDm: !!dmData[cd.m1[0].toLowerCase()], m2CanDm: !!dmData[cd.m2[0].toLowerCase()],
      m1Dm: function () { var k = cd.m1[0].toLowerCase(); if (dmData[k]) openDm(k)(); },
      m2Dm: function () { var k = cd.m2[0].toLowerCase(); if (dmData[k]) openDm(k)(); },
    };

    // ---------- Notifications ----------
    var notifRead = !!s.notifRead;
    var notifPaused = !!s.notifPaused;
    var notifItems = [
      { group: 'new', icon: 'msg', title: 'Jordan sent you a message', body: '7 works? I can show you the Water Temple trick.', time: '2m', go: openDm('jordan') },
      { group: 'new', icon: 'cal', title: 'Coffee with Jordan and Maya is tomorrow', body: 'Sun · 11 AM · café. Mo will remind you 1 hour before.', time: '1h', go: go('home') },
      { group: 'new', icon: 'badge', title: 'Your weekly plan is ready', body: 'Three small goals for this week.', time: '3h', go: go('home') },
      { group: 'earlier', icon: 'circle', title: 'New topic in Gaming', body: 'What game got you hooked? · 3 here now', time: 'Yesterday', go: go('circle', { circle: 'gaming', draft: '', sent: '', readOnly: false, unsafeHandled: false }) },
      { group: 'earlier', icon: 'badge', title: 'You earned the Breather badge', body: 'You took a pause before sending. Nice.', time: 'Sat', go: go('me') }
    ];
    var notifIcon = {
      msg: 'M4 5h16v11H8l-4 4z', cal: 'M3.5 5h17v15.5h-17zM8 3v4M16 3v4M3.5 10h17', person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 21c.8-4 3.3-6 7.5-6s6.7 2 7.5 6',
      circle: 'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 15.3c.8-.2 1.6-.3 2.5-.3 3 0 5 1.5 5.5 5',
      badge: 'M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z'
    };
    var mapNotif = function (n) {
      return { title: n.title, body: n.body, time: n.time, path: notifIcon[n.icon], isNew: n.group === 'new',
        open: function () { n.go(); } };
    };
    var newCount = notifRead ? 0 : notifItems.filter(function (n) { return n.group === 'new'; }).length;
    var notifVals = {
      isNotifs: screen === 'notifs',
      notifNew: notifItems.filter(function (n) { return n.group === 'new'; }).map(mapNotif),
      notifEarlier: notifItems.filter(function (n) { return n.group === 'earlier'; }).map(mapNotif),
      notifCount: newCount, hasNotifCount: newCount > 0,
      notifLabel: newCount ? 'Notifications, ' + newCount + ' new' : 'Notifications',
      openNotifs: function () { self.setState({ screen: 'notifs', moOpen: false, evToast: '', notifRead: true }); },
      markRead: function () { self.setState({ notifRead: true }); },
      notifBack: go('home'),
      pauseLabel: notifPaused ? 'Paused for 1 hour · Turn back on' : 'Pause notifications for 1 hour',
      pauseBg: notifPaused ? 'var(--ink)' : '#FFFFFF', pauseFg: notifPaused ? '#FFFFFF' : 'var(--ink)',
      togglePause: function () { saveQuietly({ notifPaused: !notifPaused }, notifPaused ? 'Notifications resumed' : 'Notifications paused for 1 hour'); },
      notifMoLine: notifPaused ? 'Notifications are paused. I’ll still let your trusted people reach you if you need help.' : 'I bundle notifications so they don’t pile up. Tap one to go there.'
    };

    // ---------- Themes ----------
    var themes = {
      peach: { name: 'Peach', desc: 'Warm and friendly', swatch: '#C96B45', dot: '#C96B45', accent: '#C96B45', accentDark: '#A9583A', tint: '#FCE9DE', bg: '#FCF6F0', bar: '#FCF6F0', ink: '#3A2A28', soft: '#F4E8DE', soft2: '#F6E4D6', muted: '#8F7E77', hover: '#F7EDE5' },
      sage: { name: 'Sage', desc: 'Calm greens', swatch: '#5E8C6A', dot: '#5E8C6A', accent: '#5E8C6A', accentDark: '#4A6F55', tint: '#E8F0E3', bg: '#F7F2E8', bar: '#F7F2E8', ink: '#2E3A33', soft: '#EEE8DB', soft2: '#E9E6D8', muted: '#857F72', hover: '#F2EDE2' },
      berry: { name: 'Berry', desc: 'Playful and bright', swatch: '#B85577', dot: '#B85577', accent: '#B85577', accentDark: '#9C4664', tint: '#FBE6EC', bg: '#FBF5F3', bar: '#FBF5F3', ink: '#3B2540', soft: '#F3E8EA', soft2: '#F4E4E8', muted: '#8E7C88', hover: '#F7EEF0' },
      honey: { name: 'Honey', desc: 'Cosy and golden', swatch: '#B9792A', dot: '#B9792A', accent: '#B9792A', accentDark: '#9C6420', tint: '#FBF0DA', bg: '#FCF7EC', bar: '#FCF7EC', ink: '#3A3025', soft: '#F4EBD9', soft2: '#F3E8D2', muted: '#8C8070', hover: '#F7F0E2' }
    };
    var themeKey = themes[s.theme] ? s.theme : 'peach';
    var th = themes[themeKey];
    var themeVals = {
      themeVars: { '--bg': th.bg, '--bar': th.bar, '--ink': th.ink, '--soft': th.soft, '--muted': th.muted, '--surface': '#FFFFFF', '--accent': th.accent, '--accent-dark': th.accentDark, '--tint': th.tint, '--soft2': th.soft2, '--hover': th.hover, '--safe': '#5BBB8E', '--warn': '#E8A44A', '--danger-bg': '#FAEAEA', '--border': 'rgba(30,27,46,0.08)' },
      themeName: th.name, prevAccent: th.accent, prevDot: th.dot, prevInk: th.ink,
      themeOpts: Object.keys(themes).map(function (k) {
        var t = themes[k]; var on = k === themeKey;
        return { name: t.name, desc: t.desc, bg: t.bg, ink: t.ink, swatch: t.swatch, dot: t.dot, on: on,
          ring: on ? '0 0 0 2px ' + t.ink : '0 0 0 1px rgba(0,0,0,0.08)',
          pick: function () { if (k !== themeKey) saveQuietly({ theme: k }, 'Saved ✓'); } };
      })
    };

    // ---------- Event detail: what to expect, prep, reflection, connect ----------
    var allEvents = [pastEvent].concat(events);
    var evD = allEvents.filter(function (e) { return e.id === s.evId; })[0] || events[0];
    var evDc = evD.circle ? circleData[evD.circle] : null;
    var evGoing = evD.mine || rsvp[evD.id] === 'going' || evD.past;
    var inPersonD = (evD.where || '').indexOf('In person') === 0;
    var prepItems = inPersonD
      ? ['Plan how I get there and back', 'Pick my exit line: "I had fun, heading home!"', 'Pack headphones or a fidget', 'Share my plan with someone I trust']
      : ['Test my mic, or pick text only', 'Pick an opener with Mo', 'Set a time to log off'];
    var prepDone = (s.prep || {})[evD.id] || {};
    var refl = (s.refl || {})[evD.id] || {};
    var setRefl = function (patch) { var all = Object.assign({}, s.refl || {}); all[evD.id] = Object.assign({}, refl, patch); self.setState({ refl: all }); };
    var winsList = ['I said hi', 'I asked a question', 'I stayed as long as I wanted', 'I left kindly'];
    var feelList = [['hard', 'It was hard'], ['okay', 'It was okay'], ['good', 'It went well']];
    var hiSent = s.hiSent || {};
    // Sensory meter: 1 = calm, 2 = medium, 3 = intense, from the event's own wording
    var senseLevel = function (kind, text) {
      var t = (text || '').toLowerCase();
      if (kind === 'sound') return /loud|music on/.test(t) ? 3 : (/text only|quiet/.test(t) ? 1 : (/soft|voice|background|music/.test(t) ? 2 : 1));
      if (kind === 'light') return /bright|cameras on/.test(t) ? 3 : (/dim|soft|camera off|no camera/.test(t) ? 1 : 2);
      var nums = (t.match(/\d+/g) || []).map(Number); var n = nums.length ? Math.max.apply(null, nums) : 0;
      return n <= 3 ? 1 : (n <= 6 ? 2 : 3);
    };
    var senseWords = { people: ['Small group', 'Medium group', 'Big group'], sound: ['Quiet', 'Some sound', 'Loud'], light: ['Soft', 'Medium', 'Bright'] };
    var sense = function (kind, text) { var l = senseLevel(kind, text); return { level: l, levelWord: senseWords[kind][l - 1] }; };
    var fallbackDates = { e0: ['SUN','2'], e1: ['FRI','7'], e2: ['SAT','8'], e3: ['SUN','9'], e4: ['THU','6'] };
    var detailDate = evD.dateDay ? [evD.dateDay, evD.dateNum] : (fallbackDates[evD.id] || ['SUN','9']);
    var detailTimes = evD.start ? evD.start + ' – ' + evD.end + ' · ' + evD.duration : (evD.id === 'e3' ? '11:00 AM – 12:00 PM · 1 hr' : (evD.id === 'e0' ? '7:00 PM – 8:00 PM · 1 hr' : (evD.when || '').replace(' · ', ' · ')));
    var detailVenue = evD.venue || (inPersonD ? ((evD.where || '').indexOf('library') >= 0 ? 'Tempe Public Library' : 'Cartel Coffee Lab') : '');
    var detailAddress = evD.address || (detailVenue === 'Tempe Public Library' ? '3500 S Rural Rd' : '225 W University Dr, Tempe');
    var detailRsvp = rsvp[evD.id] || '';
    var setDetailRsvp = function (value) {
      var r = Object.assign({}, rsvp); r[evD.id] = value;
      changeWithUndo({ rsvp: r }, value === 'going' ? "You're going ✓" : (value === 'maybe' ? 'Maybe saved' : "You can't go"), { rsvp: rsvp });
      // First time saying "Going" for this event: show the safety checklist
      if (value === 'going' && !(s.meetSeen || {})[evD.id]) {
        var seen = Object.assign({}, s.meetSeen || {}); seen[evD.id] = true;
        self.setState({ meetSeen: seen, showMeet: true, meetTicks: {} });
      }
    };
    var meetItems = ["It's in a public place", 'I told ' + trusted + " where I'll be", 'I know how I\'m getting home', 'I can leave anytime, no explanation needed'];;
    var evDetailVals = {
      isEvent: screen === 'event',
      edBack: go(s.evBackTo === 'circle' ? 'circle' : 'home'),
      edTitle: evD.title, edWhen: evD.when, edWhere: evD.where, edMeta: (evD.duration || '1 hr') + ' · ' + Math.max(1, evD.going || 0) + ((evD.going || 0) > 1 ? ' people' : ' person'),
      edHost: evDc ? evDc.name + ' circle' : 'Outside circles · friends', edTint: evDc ? evDc.tint : '#E4F1F0',
      edIcon: evD.circle || 'gaming', edDateDay: detailDate[0], edDateNum: detailDate[1], edTimeRange: detailTimes,
      edInPerson: inPersonD, edVenue: detailVenue, edAddress: detailAddress,
      edHostedBy: evD.mine ? 'Hosted by you' : 'Hosted by ' + ((evD.people || [])[0] || 'Jordan'),
      edSpots: (evD.going + (detailRsvp === 'going' ? 1 : 0)) + ' of ' + ((evD.size || '').match(/\d+/g) || [6]).slice(-1)[0] + ' spots',
      edRsvp: ['Going','Maybe',"Can't go"].map(function (label) { var key = label === 'Going' ? 'going' : (label === 'Maybe' ? 'maybe' : 'cant'); return { label: label, on: detailRsvp === key, pick: function () { setDetailRsvp(key); } }; }),
      edDirections: function () { notify('Directions opened'); },
      edCopyAddress: function () { notify('Address copied'); },
      edAddCalendar: function () { notify('Added to calendar'); },
      edShare: function () { notify('Share sheet opened'); },
      edSense: [
        Object.assign({ label: 'People', value: evD.size || '-', path: 'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 15.3c.8-.2 1.6-.3 2.5-.3 3 0 5 1.5 5.5 5' }, sense('people', evD.size)),
        Object.assign({ label: 'Sound', value: evD.sound || '-', path: 'M4 10v4h4l5 4V6L8 10H4ZM16.5 9a4 4 0 0 1 0 6' }, sense('sound', evD.sound)),
        Object.assign({ label: 'Lighting', value: evD.light || '-', path: 'M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' }, sense('light', evD.light)),
        { label: 'Need a break?', value: evD.exit || 'Leave anytime', path: 'M10 4H5v16h5M15 8l4 4-4 4M19 12H9' }
      ],
      edPeople: (evD.people || []).map(function (n) { return { initial: n[0], name: n }; }),
      edHasPeople: (evD.people || []).length > 0,
      edGoingText: evD.past ? (evD.people || []).length + 1 + ' went, including you' : (evD.going + (rsvp[evD.id] === 'going' ? 1 : 0)) + ' going',
      edUpcoming: !evD.past, edPast: !!evD.past,
      edCanRsvp: !evD.past && !evD.mine, edIsMine: !!evD.mine,
      edInLabel: rsvp[evD.id] === 'going' ? 'Going ✓' : "I'm in",
      edInBg: rsvp[evD.id] === 'going' ? 'var(--ink)' : 'var(--soft)', edInFg: rsvp[evD.id] === 'going' ? '#FFFFFF' : 'var(--ink)',
      edToggle: function () { var r = Object.assign({}, rsvp); r[evD.id] = rsvp[evD.id] === 'going' ? '' : 'going'; self.setState({ rsvp: r }); },
      edShowPrep: !evD.past && evGoing,
      edShowPrepHint: !evD.past && !evGoing,
      edPracticeTitle: scripts[evD.prep || 'joinin'].title,
      edPracticeWhy: inPersonD ? 'A quick warm-up before you go. 2 minutes, Level 1.' : 'Warm up before the call. 2 minutes, Level 1.',
      edPractice: function () { self.setState({ screen: 'practice', pScen: evD.prep || 'joinin', pLevel: 1, pStarted: true, pChoice: '', moOpen: false }); },
      edPrep: prepItems.map(function (t, i) {
        var on = !!prepDone[i];
        return { label: t, on: on, mark: on ? '✓' : '', box: on ? 'var(--ink)' : '#FFFFFF', strike: on ? 'line-through' : 'none', op: on ? '0.6' : '1',
          toggle: function () { var all = Object.assign({}, s.prep || {}); var cur = Object.assign({}, prepDone); cur[i] = !on; all[evD.id] = cur; self.setState({ prep: all }); } };
      }),
      edPrepCount: Object.keys(prepDone).filter(function (k) { return prepDone[k]; }).length + ' of ' + prepItems.length + ' ready',
      edReflOpen: !!evD.past && !refl.done, edReflDone: !!evD.past && !!refl.done,
      edFeel: feelList.map(function (f) {
        var on = refl.feel === f[0];
        return { label: f[1], bg: on ? 'var(--ink)' : '#FFFFFF', fg: on ? '#FFFFFF' : 'var(--ink)', pick: function () { setRefl({ feel: f[0] }); } };
      }),
      edWins: winsList.map(function (w) {
        var on = (refl.wins || []).indexOf(w) >= 0;
        return { label: w, bg: on ? 'var(--ink)' : '#FFFFFF', fg: on ? '#FFFFFF' : 'var(--ink)',
          pick: function () { var cur = refl.wins || []; setRefl({ wins: on ? cur.filter(function (x) { return x !== w; }) : cur.concat([w]) }); } };
      }),
      edCanSave: !!refl.feel, edSaveBg: refl.feel ? 'var(--ink)' : '#C5CEC7',
      edSaveRefl: function () { if (refl.feel) { var all = Object.assign({}, s.refl || {}); all[evD.id] = Object.assign({}, refl, { done: true }); self.setState({ refl: all }); } },
      edReflMo: refl.feel === 'hard' ? 'Thanks for telling me. Showing up when it is hard still counts. Next time I can suggest a smaller event.'
        : (refl.feel === 'good' ? 'Love that! I will suggest Level 2 practice next time.' : 'Okay is a real win. Every event makes the next one easier.'),
      edReflWins: (refl.wins || []).length ? 'You noted: ' + (refl.wins || []).join(', ') + '.' : '',
      edConnect: (evD.people || []).map(function (n) {
        var k = n.toLowerCase(); var canDm = !!dmData[k];
        return { name: n, initial: n[0], canDm: canDm, noDm: !canDm, sent: !!hiSent[k], notSent: !hiSent[k],
          msg: function () { self.setState({ screen: 'dm', dm: k, dmDraft: 'Thanks for last night! Want to build again sometime?', moOpen: false }); },
          hi: function () { var h = Object.assign({}, hiSent); h[k] = true; changeWithUndo({ hiSent: h }, 'Request sent', { hiSent: hiSent }); } };
      }),
      reflNudge: !(s.refl && s.refl.e0 && s.refl.e0.done),
      openPast: function () { self.setState({ screen: 'event', evId: 'e0', evBackTo: 'home', moOpen: false, evToast: '' }); }
    };
    var wasKind = s.winType === 'kind';
    var circles = Object.keys(circleData).map(function (k) {
      var c = circleData[k];
      return { key: k, name: c.name, initial: c.initial, tint: c.tint, here: c.here, topic: c.topic, icon: circleIconPaths[k],
        avatars: [c.m1[0], c.m2[0], c.m3 ? c.m3[0] : 'Sam'],
        open: function () { self.setState({ screen: 'circle', circle: k, draft: '', sent: '', menuOpen: false, safetyNote: '', unsafeHandled: false, moOpen: false }); } };
    });

    // ---------- First-time setup, comfort, journey ----------
    var onbStep = s.onbStep || 1;
    var trustedPhone = tc0.phone === undefined ? '(480) 555-0142' : tc0.phone;
    var trustedEmail = tc0.email || '';
    var interestText = interests.map(function (k) { return circleData[k] ? circleData[k].name.toLowerCase() : k; }).slice(0, 2).join(' and ') || 'new things';
    var segOpts = function (list, cur, key) {
      return list.map(function (pair) {
        var on = pair[0] === cur; var o = {}; o[key] = pair[0];
        var previous = {}; previous[key] = cur;
        return { label: pair[1], on: on, cls: on ? 'on' : '', pick: function () { if (!on) saveQuietly(o, 'Saved ✓'); } };
      });
    };
    var phoneOk = function (c) { return (c.phone || '').replace(/\D/g, '').length >= 10; };
    var emailOk = function (c) { return !c.email || /.+@.+\..+/.test(c.email); };
    var contactValid = function (c) { return !!(c.name || '').trim() && phoneOk(c) && emailOk(c); };
    var contactBlank = function (c) { return !(c.name || '').trim() && !(c.phone || '').trim() && !(c.email || '').trim(); };
    var setContact = function (i, patch) {
      var arr = tcs.map(function (c) { return Object.assign({}, c); });
      while (arr.length <= i) arr.push(Object.assign({}, blankContact));
      Object.assign(arr[i], patch);
      var st = { trustedContacts: arr };
      if (i === 0 && patch.otherRole !== undefined) st.otherRole = patch.otherRole;
      self.setState(st);
    };
    var showSecond = tcs.length > 1 || !!s.showSecond;
    var firstDone = contactValid(tc0);
    var customInterest = s.customInterest || '';
    var otherOpen = !!s.otherOpen;
    var customFilled = otherOpen && !!customInterest.trim();
    var onbOk = onbStep === 2 ? (interests.length > 0 || customFilled) : (onbStep === 3 ? (firstDone && (!tcs[1] || contactBlank(tcs[1]) || contactValid(tcs[1]))) : true);
    var onbVals = {
      isOnboard: screen === 'onboard',
      onbStep: onbStep, onbStepText: 'Step ' + (onbStep - 1) + ' of 3', onbShowProgress: onbStep > 1,
      onbPct: Math.round(((onbStep - 1) / 3) * 100) + '%',
      onb1: onbStep === 1, onb2: onbStep === 2, onb3: onbStep === 3, onb4: onbStep === 4,
      onbBack: function () { if (onbStep === 3 && s.onbReturn) { self.setState({ screen: s.onbReturn, onbReturn: '', onbStep: 1 }); resetScroll(); return; } self.setState({ onbStep: Math.max(1, onbStep - 1) }); resetScroll(); },
      onbNext: function () {
        if (!onbOk) return;
        var extra = {};
        if (onbStep === 3) {
          if (tcs[1] && contactBlank(tcs[1])) { extra.trustedContacts = [tcs[0]]; extra.showSecond = false; }
          else if (!s.trustedContacts) extra.trustedContacts = tcs;
          if (s.onbReturn) { self.setState(Object.assign(extra, { screen: s.onbReturn, onbReturn: '', onbStep: 1 })); resetScroll(); return; }
        }
        if (onbStep >= 4) self.setState({ onbDone: true, screen: 'checkin', ciStep: 0 });
        else self.setState(Object.assign(extra, { onbStep: onbStep + 1 }));
        resetScroll();
      },
      onbNextLabel: onbStep === 1 ? 'Get started' : (onbStep === 4 ? 'I understand, let’s go' : 'Next'),
      onbNextBg: onbOk ? 'var(--ink)' : '#C5CEC7',
      interestOpts: Object.keys(circleData).map(function (k) {
        var on = interests.indexOf(k) >= 0;
        return { key: k, name: circleData[k].name, tint: circleData[k].tint, on: on,
          ring: on ? '0 0 0 2px var(--ink)' : '0 0 0 1px rgba(0,0,0,0.06)',
          pick: function () { var next = on ? interests.filter(function (x) { return x !== k; }) : interests.concat([k]); if (next.length || customFilled) saveQuietly({ interests: next }, 'Saved ✓'); } };
      }),
      interestCount: (interests.length + (customFilled ? 1 : 0)) ? (interests.length + (customFilled ? 1 : 0)) + ' picked' : 'Pick at least one',
      otherOpen: otherOpen, customInterest: customInterest, otherRing: otherOpen ? '0 0 0 2px var(--ink)' : '0 0 0 1px rgba(0,0,0,0.06)',
      toggleOther: function () { self.setState({ otherOpen: !otherOpen }); },
      setCustomInterest: function (e) { self.setState({ customInterest: e.target.value }); },
      trusted: trusted, trustedRel: trustedRel,
      trustedPhone: trustedPhone, trustedEmail: trustedEmail,
      trustedContact: trustedPhone + (trustedEmail ? ' · ' + trustedEmail : ''),
      contactForms: (showSecond ? [0, 1] : [0]).map(function (i) {
        var c = tcs[i] || blankContact;
        var touched = i === 0 || !contactBlank(c);
        return { idx: i, name: c.name || '', phone: c.phone || '', email: c.email || '', otherRole: c.otherRole || '', showOther: c.rel === 'Other',
          phoneHint: (touched && !phoneOk(c)) ? 'Add a 10-digit number so Mo can text them.' : '',
          emailHint: emailOk(c) ? '' : 'Check the email address, or leave it blank.',
          setName: function (e) { setContact(i, { name: e.target.value }); },
          setPhone: function (e) { setContact(i, { phone: e.target.value }); },
          setEmail: function (e) { setContact(i, { email: e.target.value }); },
          setOther: function (e) { setContact(i, { otherRole: e.target.value }); },
          rels: ['Parent', 'Guardian', 'Sibling', 'Coach', 'Other'].map(function (r) {
            var on = r === (c.rel || 'Parent');
            return { label: r, on: on, bg: on ? 'var(--ink)' : '#FFFFFF', fg: on ? '#FFFFFF' : 'var(--ink)', pick: function () { setContact(i, { rel: r }); } };
          }) };
      }),
      canAddSecond: firstDone && !showSecond,
      addSecond: function () { self.setState({ showSecond: true, trustedContacts: tcs.length > 1 ? tcs : tcs.concat([Object.assign({}, blankContact)]) }); },
      sizeSeg: segOpts([[false, 'Default'], [true, 'Large']], textLarge, 'textLarge'),
      moHelpSeg: segOpts([['lots', 'Lots'], ['some', 'Some'], ['ask', 'When I ask']], moHelp, 'moHelp'),
      calmSeg: segOpts([[false, 'Off'], [true, 'On']], calmMode, 'calmMode'),
      wordsSeg: segOpts([[false, 'Friendly'], [true, 'Plain']], plainWords, 'plainWords'),
      stepWord: stepWord, stepsWord: stepWord + 's', stepOne: '+1 ' + stepWord, stepsPerWeek: plainWords ? 'Steps per week' : 'Brave steps per week',
      chatSeg: segOpts([[true, 'Text first'], [false, 'Voice is okay']], textFirst, 'textFirst'),
      appClass: 'bridge-app app-root' + (calmMode ? ' calm calm-mode' : '') + (textLarge ? ' text-large' : ''),
      journey: [['Oct 13', 1], ['Oct 20', 2], ['Oct 27', 3], ['This week', steps]].map(function (w, i, all) {
        var max = Math.max.apply(null, all.map(function (x) { return x[1]; })) || 1;
        return { label: w[0], value: w[1], h: Math.max(10, Math.round((w[1] / max) * 84)) + 'px', bg: i === all.length - 1 ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 30%, #FFFFFF)' };
      }),
      journeyUp: steps > 3 ? 'Up from 3 last week' : 'Every step counts',
      redoSetup: function () { self.setState({ screen: 'onboard', onbStep: 2, moOpen: false }); }
    };
    var openMeScreen = function (target) {
      return function () {
        var el = document.querySelector('.screen-transition');
        self.setState({ screen: target, meScroll: el ? el.scrollTop : 0, moOpen: false });
      };
    };
    var meScreenNames = ['me-journey','me-trusted','me-profile','me-colors','me-comfort','me-interests','me-privacy'];
    var meVals = {
      isMeJourney: screen === 'me-journey', isMeTrusted: screen === 'me-trusted',
      isMeProfile: screen === 'me-profile', isMeColors: screen === 'me-colors', isMeComfort: screen === 'me-comfort',
      isMeInterests: screen === 'me-interests', isMePrivacy: screen === 'me-privacy',
      meBack: function () { self.setState({ screen: 'me', moOpen: false }); },
      interestNames: interests.map(function (k) { return circleData[k] ? circleData[k].name : k; }).concat(customFilled ? [customInterest.trim()] : []).join(' · '),
      interestTotal: interests.length,
      openJourney: openMeScreen('me-journey'), openTrusted: openMeScreen('me-trusted'),
      openProfile: openMeScreen('me-profile'), openColors: openMeScreen('me-colors'), openComfort: openMeScreen('me-comfort'),
      openInterests: openMeScreen('me-interests'), openPrivacy: openMeScreen('me-privacy'),
      comfortSummary: textLarge ? 'Large text' : (calmMode ? 'Calm mode on' : (textFirst ? 'Text first' : 'Voice is okay')),
      blockedSummary: (dmReqState === 'reported' || (s.safetyNote || '').toLowerCase().indexOf('blocked') >= 0) ? 'Alex' : 'No blocked people',
      meSettings: [
        { label: 'Profile', value: '', path: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 21c.8-4 3.3-6 7.5-6s6.7 2 7.5 6', open: openMeScreen('me-profile') },
        { label: 'Colors', value: themeVals.themeName, swatch: th.swatch, path: 'M12 3a9 9 0 1 0 0 18c1.6 0 2.2-1.2 1.5-2.3-.6-1 .1-2.2 1.3-2.2H17a4 4 0 0 0 4-4C21 7.3 17 3 12 3Z', open: openMeScreen('me-colors') },
        { label: 'Comfort', value: textLarge ? 'Large' : (calmMode ? 'Calm' : 'Default'), path: 'M4 12h16M12 4v16M6.5 6.5l11 11M17.5 6.5l-11 11', open: openMeScreen('me-comfort') },
        { label: 'Interests', value: interests.length + ' picked', path: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z', open: openMeScreen('me-interests') },
        { label: 'Privacy & safety', value: '', path: 'M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z', open: openMeScreen('me-privacy') }
      ],
      homeActive: Object.keys(circleData).sort(function (a, b) { return (interests.indexOf(b) >= 0 ? 1 : 0) - (interests.indexOf(a) >= 0 ? 1 : 0); }).slice(0, 3).reduce(function (n, k) { return n + circleData[k].here; }, 0),
      moGradient: ['#EEF4F0', '#B8D4C8', '#7FB8A8'],
      planEdit: !!s.planEdit, togglePlanEdit: function () { self.setState({ planEdit: !s.planEdit }); },
      planGoals: (s.planGoals || defaultPlan).map(function (text, i) {
        var done = !!(s.planDone || {})[i];
        return { text: text, done: done,
          toggle: function () { var d = Object.assign({}, s.planDone || {}); d[i] = !done; self.setState({ planDone: d }); },
          setText: function (e) { var g = (s.planGoals || defaultPlan).slice(); g[i] = e.target.value; self.setState({ planGoals: g }); } };
      }),
      breatheLeft: Math.floor(breatheLeft / 60) + ':' + ('0' + (breatheLeft % 60)).slice(-2),
      breatheLabel: s.breatheActive === false && breatheLeft === 0 ? 'Nicely done' : ({ in: 'Breathe in...', hold: 'Hold...', out: 'Breathe out...' })[s.breathePhase || 'in'],
      breatheClass: !s.breatheActive ? '' : ({ in: 'breathe-in', hold: 'breathe-hold', out: 'breathe-out' })[s.breathePhase || 'in'],
      breatheKey: (s.breathePhase || 'in') + Math.floor((60 - breatheLeft) / 11),
      breatheActive: !!s.breatheActive,
      startBreathe: function () { self.startBreathe(); },
      statusBg: screen === 'angry' ? '#FFF6ED' : (screen === 'celebrate' ? 'var(--tint)' : 'var(--bg)'),
      clockText: new Date(s.clockTick || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      barNotifCount: newCount,
      calmOn: calmMode, goComfort: openMeScreen('me-comfort'),
      isMeArea: screen === 'me' || meScreenNames.indexOf(screen) >= 0
    };
    return Object.assign(evVals, profVals, dmVals, notifVals, themeVals, evDetailVals, onbVals, meVals, {
      meContacts: tcs.map(function (c, i) {
        var rl = (c.rel === 'Other' && (c.otherRole || '').trim()) ? c.otherRole.trim() : (c.rel || 'Parent');
        return { name: (c.name || '').trim() || (i ? 'Contact 2' : 'Mom'), rel: rl, blank: i > 0 && contactBlank(c),
          open: function () { var el = document.querySelector('.screen-transition'); self.setState({ screen: 'me-trusted', meContact: i, meScroll: el ? el.scrollTop : 0, moOpen: false }); } };
      }).filter(function (c) { return !c.blank; }),
      ctName: ((tcs[Math.min(s.meContact || 0, tcs.length - 1)].name || '').trim()) || 'Mom',
      ctInitial: (((tcs[Math.min(s.meContact || 0, tcs.length - 1)].name || '').trim()) || 'Mom')[0].toUpperCase(),
      ctRole: (function () { var c = tcs[Math.min(s.meContact || 0, tcs.length - 1)]; return (c.rel === 'Other' && (c.otherRole || '').trim()) ? c.otherRole.trim() : (c.rel || 'Parent'); })(),
      ctPhone: tcs[Math.min(s.meContact || 0, tcs.length - 1)].phone || '',
      ctOnlyOne: tcs.filter(function (c, i) { return i === 0 || !contactBlank(c); }).length === 1,
      editContact: function () { self.setState({ screen: 'onboard', onbStep: 3, onbReturn: 'me-trusted', moOpen: false }); },
      addFromMe: function () { self.setState({ screen: 'onboard', onbStep: 3, onbReturn: 'me', showSecond: true, trustedContacts: tcs.length > 1 ? tcs : tcs.concat([Object.assign({}, blankContact)]), moOpen: false }); },
      circles: circles, screenKey: screen, uiToast: s.uiToast || '', hasUiToast: !!s.uiToast, hasUndo: !!s.undoPatch, toastQuiet: !!s.toastQuiet,
      clearToast: function () { self.setState({ uiToast: '', undoPatch: null, undoToken: 0 }); },
      undoToast: function () {
        if (!s.undoPatch) return;
        self.setState(Object.assign({}, s.undoPatch, { uiToast: 'Undone', undoPatch: null, undoToken: 0 }));
        setTimeout(function () { if (self.state.uiToast === 'Undone') self.setState({ uiToast: '' }); }, 1800);
      },
      isCircles: screen === 'circles',
      isGaming: cKey === 'gaming',
      cName: cd.name, cTopic: cd.topic,
      m1Name: cd.m1[0], m1Text: cd.m1[1], m2Name: cd.m2[0], m2Text: cd.m2[1],
      goCircles: go('circles'),
      goGaming: go('circle', { circle: 'gaming', draft: '', sent: '' }),
      winBadge: wasKind ? 'Kind Words' : 'First Hello',
      winTitle: wasKind ? 'You disagreed without hurting anyone' : 'You joined the conversation',
      winText: wasKind ? "That's a real friendship skill. Jordan just invited you to play on Friday." : cd.m2[0] + " replied to you. That's how friendships start.",
      isHome: screen === 'home', isCircle: screen === 'circle', isPause: screen === 'pause', isReset: screen === 'reset',
      isPractice: screen === 'practice', isFeedback: screen === 'feedback', isWin: screen === 'win', isMe: screen === 'me',
      showTabs: ['pause', 'reset', 'win', 'checkin', 'help', 'newEvent', 'onboard', 'angry', 'celebrate'].indexOf(screen) < 0,
      // Greeting that follows the time of day
      greeting: (function () { var h = new Date().getHours(); return h < 12 ? 'Good morning' : (h <= 17 ? 'Good afternoon' : 'Good evening'); })(),
      steps: steps, stepBump: !!s.stepBump, showCelebrate: !!s.stepBump && screen !== 'win',
      homeMood: ciFeel === 'over' ? 'calm' : 'happy',
      rootBg: screen === 'angry' ? '#FFF6ED' : (screen === 'celebrate' ? 'linear-gradient(160deg, var(--tint) 0%, var(--tint) 40%, var(--bg) 100%)' : 'var(--bg)'),
      lastBadge: s.lastBadge || 'First step',
      angryDebrief: !!s.angryDebrief,
      debriefTalk: go('practice', { pChoice: 'boundary', angryDebrief: false }),
      homeTodayTitle: recList[0].title, homePicked: !!hardFirst, homeStart: recList[0].start,
      homeCircles: Object.keys(circleData).sort(function (a, b) { return (interests.indexOf(b) >= 0 ? 1 : 0) - (interests.indexOf(a) >= 0 ? 1 : 0); }).slice(0, 3).map(function (k) {
        var c = circleData[k];
        return { key: k, isNew: interests.indexOf(k) < 0, name: c.name, here: c.here, color: circleColors[k] || '#6A6080', iconBg: circleTints[k] || '#F0EDE8',
          open: function () { self.setState({ screen: 'circle', circle: k, draft: '', sent: '', readOnly: false, unsafeHandled: false, moOpen: false, safetyNote: '' }); } };
      }),
      isAngryScreen: screen === 'angry',
      angryBreath: go('reset', { trustSent: false, resetFrom: 'angry' }),
      groundActive: gs !== null && gs < 5, groundDone: gs === 5,
      groundPrompt: ['Name 1 thing you can see', 'Name 1 thing you can hear', 'Name 1 thing you can touch', 'Name 1 thing you can smell', 'Name 1 thing you can taste'][gs] || '',
      groundCount: gs === null ? '' : (Math.min(gs + 1, 5) + ' of 5'),
      groundStart: function () { self.setState({ groundStep: 0 }); },
      groundNext: function () { self.setState({ groundStep: (gs === null ? 0 : gs) + 1 }); },
      groundBack: function () { self.setState({ groundStep: null }); },
      angryLater: go('home', { angryDebrief: true }),
      angryBack: go(s.prevScreen && s.prevScreen !== 'angry' ? s.prevScreen : 'home'),
      isCelebrate: screen === 'celebrate',
      celebrateHome: go('home'), celebrateBadges: go('me'),
      confetti: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) { return { cls: 'confetti confetti-piece confetti-' + i, color: ['#5BBB8E', '#E8A44A', '#F0A58C', 'var(--accent)', 'var(--muted)', '#F9C8B4'][i % 6], delay: (i * 0.4 / 11).toFixed(2) + 's' }; }),
      moLine: ciHardLine ? ciHardLine : ciFeel === 'over' ? "Thanks for telling me. Let's keep today gentle. Just reading a circle counts." : (ciFeel === 'ready' ? "You're ready to connect! Let's practice, then go for it." : (ciUp === 'none' ? "Let's warm up with one small practice today." : "Let's warm up for your " + upLabels[ciUp].toLowerCase().replace('a ', '') + '.')),
      isLow: battery === 'low', isOkay: battery === 'okay', isFull: battery === 'full',
      lowBg: pick(battery === 'low'), okayBg: pick(battery === 'okay'), fullBg: pick(battery === 'full'),
      lowFg: pickFg(battery === 'low'), okayFg: pickFg(battery === 'okay'), fullFg: pickFg(battery === 'full'),
      setLow: function () { self.setState({ battery: 'low' }); },
      setOkay: function () { self.setState({ battery: 'okay' }); },
      setFull: function () { self.setState({ battery: 'full' }); },
      goHome: go('home'), goCircle: go('circle'), goPractice: go('practice', { pChoice: '', pStarted: false, pTyped: '', pOwn: '', pHintUsed: false }), goMe: go('me'),
      goReset: go('reset', { trustSent: false, resetFrom: screen }), goFeedback: go('feedback', { pStep: Math.min(3, pStep + 1) }),
      menuOpen: !!s.menuOpen,
      toggleMenu: function () { self.setState({ menuOpen: !s.menuOpen }); },
      doReport: function () { changeWithUndo({ menuOpen: false, safetyNote: 'Thanks. A moderator will check this chat.' }, 'Report sent', { menuOpen: !!s.menuOpen, safetyNote: s.safetyNote || '' }); },
      doBlock: function () { changeWithUndo({ menuOpen: false, safetyNote: 'Done. You can block anyone, anytime.' }, 'Member blocked', { menuOpen: !!s.menuOpen, safetyNote: s.safetyNote || '' }); },
      hasSafetyNote: !!s.safetyNote, safetyNote: s.safetyNote || '',
      isSent: !!sent,
      sentText: drafts[sent] || '',
      jordanReply: replies[sent] || '',
      resultMood: sentKind ? 'happy' : 'calm',
      resultLine: sentKind ? cd.m2[0] + (plainWords ? ' replied.' : ' replied! That was a brave step.') : "Sent. If it didn't land well, I can help you follow up.",
      resultButton: sentKind ? 'Get my badge' : 'Help me follow up',
      resultAction: sentKind ? function () { self.setState({ screen: 'win', won: true, winCount: (s.winCount || 0) + 1, winType: sent === 'kind' ? 'kind' : 'hello' }); } : go('practice', { pChoice: '', pStarted: false }),
      showSuggest: !sent && !draft && !readOnly,
      showComposer: !sent && !readOnly,
      chipAsk: function () { self.setState({ draft: 'ask' }); },
      chipShare: function () { self.setState({ draft: 'share' }); },
      chipOwn: function () { self.setState({ draft: 'angry' }); },
      hasDraft: !!draft,
      draftShown: draft ? drafts[draft] : 'Message the ' + cd.name + ' circle',
      draftColor: draft ? 'var(--ink)' : 'var(--muted)',
      draftRing: isAngry ? '0 0 0 2px #EE9F95' : 'none',
      toneBg: isAngry ? '#FBE1DC' : 'var(--tint)',
      toneDot: isAngry ? 'var(--ink)' : '#5BBB8E',
      toneLabel: isAngry ? 'Mo: this might sound harsh' : 'Mo: sounds friendly',
      toneWhy: isAngry ? 'Why: "Seriously" and "overrated" can sound like you are making fun of what ' + cd.m2[0] + ' loves.' : '', hasToneWhy: isAngry,
      sendBg: draft ? 'var(--ink)' : '#FFFFFF',
      sendIcon: draft ? '#FFFFFF' : '#8C83A0',
      send: function () {
        if (!draft) return;
        if (draft === 'angry') self.setState({ screen: 'pause' });
        else changeWithUndo({ sent: draft, draft: '' }, '', { sent: sent, draft: draft }); // Undo lives on the result card, so no toast covers it
      },
      sayKindly: go('circle', { draft: 'kind' }),
      sendAnyway: go('circle', { sent: 'angry', draft: '' }),
      walkBg: pick(plan === 'walk'), musicBg: pick(plan === 'music'), waterBg: pick(plan === 'water'),
      walkFg: pickFg(plan === 'walk'), musicFg: pickFg(plan === 'music'), waterFg: pickFg(plan === 'water'),
      planWalk: function () { self.setState({ plan: 'walk' }); },
      planMusic: function () { self.setState({ plan: 'music' }); },
      planWater: function () { self.setState({ plan: 'water' }); },
      // After the breather, go back to where the user came from (from the pause screen, return to the chat with a gentler draft)
      readyAfterReset: s.resetFrom === 'pause' ? go('circle', { draft: 'kind' }) : go(s.resetFrom && s.resetFrom !== 'reset' ? s.resetFrom : 'home'),
      textTrusted: function () { saveQuietly({ trustSent: true }, 'Text sent to ' + trusted); },
      trustSent: !!s.trustSent,
      pChosen: !!pChoice, pNotChosen: !pChoice,
      pText: pChoice === 'own' ? pOwn : (choiceGood ? ps.good : ps.vague),
      pReply: choiceGood ? ps.goodReply : ps.vagueReply,
      pTitle: ps.title, pPartner: ps.partner, pOpener: ps.opener, pHint: ps.hint,
      pGoodText: ps.good, pVagueText: ps.vague,
      showHint: pLevel === 1 || (pLevel === 2 && pHintUsed),
      levelLabel: levelNames[pLevel - 1],
      pPicking: !pStarted && !pBoundary, pStarted: pStarted && !pBoundary, pBoundary: pBoundary,
      pJourney: ['Say hello', 'Ask something', 'Reply kindly'].map(function (label, i) {
        var done = i < pStep, active = i === pStep;
        return { label: label, done: done, active: active, bg: done ? '#5BBB8E' : (active ? 'var(--accent)' : 'var(--soft)'), border: (!done && !active) ? '2px solid var(--muted)' : 'none' };
      }),
      pLevelText: 'Level ' + pLevel + ' · ' + (3 - pStep) + ' scenarios left',
      startBoundary: function () { self.setState({ pScen: 'boundary', pChoice: '', pStarted: true, pTyped: '', pOwn: '', pHintUsed: false }); },
      boundaryHelp: go('help', { helpSent: false, prevScreen: 'practice' }),
      recScenarios: recScenarios, moreScenarios: moreScenarios, pScene: ps.scene, levels: levelList,
      startPractice: function () { self.setState({ pStarted: true, pChoice: '', pTyped: '', pOwn: '', pHintUsed: false }); },
      levelExplain: pLevel === 1 ? 'Guided: Mo shows a hint and two replies to choose from.' : (pLevel === 2 ? 'Light help: choose a reply. Ask Mo for one hint only if you need it.' : 'On your own: no choices. Type your reply like a real chat, and Mo gives feedback after.'),
      pShowChoices: !pChoice && pLevel < 3, pShowType: !pChoice, pTypeLabel: pLevel === 3 ? 'No hints this time. Reply like you would in a real chat.' : 'Or say it your own way',
      pChoiceVagueFirst: pLevel === 2, pChoiceGoodFirst: pLevel !== 2,
      pHintAsk: !pChoice && pLevel === 2 && !pHintUsed,
      askHint: function () { self.setState({ pHintUsed: true }); },
      pTyped: pTyped,
      setTyped: function (e) { self.setState({ pTyped: e.target.value }); },
      sendTyped: function () { if (pTyped.trim()) self.setState({ pOwn: pTyped.trim(), pChoice: 'own', pTyped: '' }); },
      typedKey: function (e) { if (e.key === 'Enter' && pTyped.trim()) self.setState({ pOwn: pTyped.trim(), pChoice: 'own', pTyped: '' }); },
      typedSendBg: pTyped.trim() ? 'var(--ink)' : '#C5CEC7',
      typedHasTone: pTyped.trim().length > 0,
      typedTone: typedEv.harsh ? 'Might sound harsh' : (typedEv.words < 4 ? 'A bit short' : ((typedEv.asks || typedEv.kind) ? 'Sounds friendly' : 'Okay so far')),
      typedDot: typedEv.harsh ? 'var(--ink)' : (typedEv.words < 4 ? '#E3B341' : '#5BBB8E'),
      typedToneBg: typedEv.harsh ? '#FBE1DC' : (typedEv.words < 4 ? '#FBF0D6' : 'var(--tint)'),
      fbIsOwn: pChoice === 'own', fbExample: ps.good,
      fillGood: function () { self.setState({ pTyped: ps.good }); setTimeout(function () { var f = document.getElementById('text-input-field'); if (f) f.focus(); }, 0); },
      fillVague: function () { self.setState({ pTyped: ps.vague }); setTimeout(function () { var f = document.getElementById('text-input-field'); if (f) f.focus(); }, 0); },
      pickGood: function () { self.setState({ pChoice: 'good' }); },
      pickVague: function () { self.setState({ pChoice: 'vague' }); },
      fbTitle: choiceGood ? 'You did it well' : 'Good start',
      fbStar: pChoice === 'own' ? (ownEv.good ? 'You wrote it yourself' + (ownEv.asks ? ' and asked a question back, which keeps the chat going.' : ' and kept it warm and clear.') : 'You wrote your own reply. That is the hardest level, and you did it.') : (choiceGood ? ps.starGood : ps.starVague),
      fbSpark: pChoice === 'own' ? (ownEv.harsh ? '"' + ownEv.harsh + '" can sound harsh. Try saying how you feel instead, like "I was looking forward to it."' : (ownEv.words < 4 ? 'Add a little more, like a question or how you feel, so they know what to say next.' : (ownEv.good ? (ownEv.asks ? 'Next time, share a little about you too, so it feels like a two-way chat.' : 'Ask a question back to keep it going.') : 'Try adding a question back or a kind word, so they feel welcome to reply.'))) : (choiceGood ? ps.sparkGood : ps.sparkVague),
      hasUnsafe: !!cd.m3,
      m3Name: cd.m3 ? cd.m3[0] : '', m3Text: cd.m3 ? cd.m3[1] : '',
      showUnsafeCard: !s.unsafeHandled,
      unsafeReport: function () { changeWithUndo({ unsafeHandled: true, safetyNote: 'Reported. A moderator will review Alex. Thanks for keeping the circle safe.' }, 'Reported Alex', { unsafeHandled: !!s.unsafeHandled, safetyNote: s.safetyNote || '' }); },
      unsafeBlock: function () { changeWithUndo({ unsafeHandled: true, safetyNote: 'Alex is blocked. They can’t message you anymore.' }, 'Blocked Alex', { unsafeHandled: !!s.unsafeHandled, safetyNote: s.safetyNote || '' }); },
      unsafeIgnore: function () {
        self.setState({ unsafeHandled: true, unsafeIgnored: true });
        setTimeout(function () {
          if (self.state.unsafeIgnored && self.state.screen === 'circle') self.setState({ showMoNudge: true, unsafeIgnored: false });
          else self.setState({ unsafeIgnored: false });
        }, 3000);
      },
      showFloat: ['practice', 'feedback'].indexOf(screen) < 0,
      showMoMenu: !!s.moOpen,
      finishWin: go('celebrate', { lastBadge: s.winBadge || (wasKind ? 'Kind Words' : 'First Hello') }),
      momOn: momOn,
      momBg: momOn ? '#5BBB8E' : '#DCD5E8', momJustify: momOn ? 'flex-end' : 'flex-start',
      toggleMom: function () { self.setState({ momOn: !momOn }); },
      isCheckin: screen === 'checkin', isHelp: screen === 'help',
      feelOpts: ciChips(feelLabels, 'ciFeel', 1), upOpts: ciChips(upLabels, 'ciUp', 2),
      hardOpts: ciChips({ meet: 'Meeting new people', close: 'Staying close to people I know', tricky: 'Handling tricky moments', work: 'Talking at work or school' }, 'ciHard', 'home'),
      ciStep: ciStep, ciBack: function () { self.setState({ ciStep: Math.max(0, ciStep - 1) }); resetScroll(); },
      ciDots: [0, 1, 2].map(function (i) { return { bg: i === ciStep ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 30%, #FFFFFF)' }; }),
      ciQuestion: ['Hi ' + (pFirst || 'there') + '! How are you feeling?', 'Anything coming up?', 'What would you like help with?'][ciStep],
      finishCheckin: go('home', { homeFull: false }), goCheckin: go('checkin', { ciStep: 0 }),
      showDay: ciFeel !== 'over' || !!s.homeFull, calmDay: ciFeel === 'over' && !s.homeFull,
      showMyDay: function () { self.setState({ homeFull: true }); setTimeout(function () { var el = document.getElementById('home-day'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 60); },
      ciSummary: feelLabels[ciFeel] + (ciUp === 'none' ? '' : ' · ' + (ciUp === 'group' ? 'hangout' : upLabels[ciUp].toLowerCase().replace('a ', '')) + ' coming up'),
      recList: recList, upNextText: ciHardLine || upNextText,
      joinLabel: ciFeel === 'over' ? 'Read Gaming chat' : 'Join Gaming chat',
      homeJoin: function () { self.setState({ screen: 'circle', circle: 'gaming', draft: '', sent: '', readOnly: ciFeel === 'over', unsafeHandled: false, menuOpen: false, moOpen: false }); },
      circlesMoLine: ciFeel === 'over' ? 'Feeling overwhelmed? Try "Just read". No one expects you to post.' : 'You like ' + interestText + '. Start there?',
      filterOpts: chip({ foryou: 'For you', all: 'All' }, cFilter, 'cFilter'),
      circleCards: Object.keys(circleData).filter(function (k) {
        if (cFilter === 'foryou') return interests.indexOf(k) >= 0;
        if (cFilter === 'quiet') return circleData[k].here <= 3;
        return true;
      }).map(function (k) {
        var c = circleData[k];
        var grads = { gaming: 'linear-gradient(120deg, #F9DCE4, #E3E0F8)', music: 'linear-gradient(120deg, #E3E0F8, #DCE4FA)', anime: 'linear-gradient(120deg, #FBE1D8, #F9DCE4)', cooking: 'linear-gradient(120deg, var(--tint), #F6E5C9)', art: 'linear-gradient(120deg, #F6E5C9, #FBE1D8)', tech: 'linear-gradient(120deg, #DCE4FA, var(--tint))' };
        return { key: k, name: c.name, here: c.here, topic: c.topic, grad: grads[k], tint: c.tint, color: circleColors[k] || '#6A6080', iconBg: circleTints[k] || '#F0EDE8', icon: circleIconPaths[k], avatars: [c.m1[0], c.m2[0], c.m3 ? c.m3[0] : 'Sam'],
          open: function () { self.setState({ screen: 'circle', circle: k, draft: '', sent: '', readOnly: false, unsafeHandled: false, moOpen: false, safetyNote: '' }); },
          read: function () { self.setState({ screen: 'circle', circle: k, draft: '', sent: '', readOnly: true, unsafeHandled: false, moOpen: false, safetyNote: '' }); } };
      }),
      isReadOnly: readOnly,
      stopReading: function () { self.setState({ readOnly: false }); },
      helpSent: !!s.helpSent, helpNotSent: !s.helpSent,
      sendHelp: function () { self.setState({ helpSent: true }); },
      tabIsHome: screen === 'home', tabIsCircles: screen === 'circles' || screen === 'circle' || screen === 'dm', tabIsMe: screen === 'me' || meScreenNames.indexOf(screen) >= 0,
      homeBg: screen === 'home' ? 'var(--accent)' : 'transparent', homeFg: screen === 'home' ? '#FFFFFF' : '#FFFFFF', homePad: screen === 'home' ? '0 18px' : '0',
      circlesBg: (screen === 'circles' || screen === 'circle' || screen === 'dm') ? 'var(--accent)' : 'transparent', circlesFg: (screen === 'circles' || screen === 'circle' || screen === 'dm') ? '#FFFFFF' : '#FFFFFF', circlesPad: (screen === 'circles' || screen === 'circle' || screen === 'dm') ? '0 18px' : '0',
      meBg: (screen === 'me' || meScreenNames.indexOf(screen) >= 0) ? 'var(--accent)' : 'transparent', meFg: (screen === 'me' || meScreenNames.indexOf(screen) >= 0) ? '#FFFFFF' : '#FFFFFF', mePad: (screen === 'me' || meScreenNames.indexOf(screen) >= 0) ? '0 18px' : '0',
      moBtnBg: s.moOpen ? '#FFFFFF' : 'var(--soft)',
      tabHomeBg: tab('home'), tabCircleBg: tab('circle'), tabMeBg: tab('me'),
      moOpen: !!s.moOpen,
      toggleMo: function () { self.setState({ moOpen: !s.moOpen }); },
      moX: s.moX === undefined ? 299 : s.moX, moY: s.moY === undefined ? 21 : s.moY, moDragging: !!s.moDragging,
      moDown: function (e) { self.moDown(e); }, moMove: function (e) { self.moMove(e); }, moUp: function (e) { self.moUp(e); },
      moKey: function (e) { if (e.detail === 0) self.setState({ moOpen: !s.moOpen }); },
      moPopupPos: (function () {
        var host = (typeof document !== 'undefined' && document.querySelector('.phone')) || null;
        var W = host ? host.clientWidth : 390, H = host ? host.clientHeight : 844;
        var x = s.moX === undefined ? 299 : s.moX, y = s.moY === undefined ? 21 : s.moY;
        var pos = (x + 30 < W / 2) ? { left: x + 'px', right: 'auto' } : { right: Math.max(10, W - x - 60) + 'px', left: 'auto' };
        // above Mo normally; below it when Mo sits in the top half of the screen
        if (y > H / 2) pos.top = (H - y + 8) + 'px'; else pos.bottom = (y + 80) + 'px';
        return pos;
      })(),
      closeMo: function () { self.setState({ moOpen: false }); },
      moBottom: screen === 'circle' ? '200px' : '100px',
      menuBottom: screen === 'circle' ? '280px' : '180px',
      floatMood: ciFeel === 'ready' ? 'happy' : ((ciFeel === 'over' || ciFeel === 'overwhelmed') ? 'worried' : 'calm'),
      moPracticeHint: screen === 'circle' ? 'Practice replying to ' + cd.m2[0] : (screen === 'home' ? 'Practice inviting someone' : 'Practice a conversation'),
      moPractice: go('practice', { pChoice: '', pStarted: false }),
      moBreathe: go('reset', { trustSent: false, resetFrom: screen }),
      showPracticeGate: !!s.showPracticeGate,
      showStepBack: (s.winCount || 0) >= 3 && !s.stepBackAsked && moHelp !== 'ask',
      stepBackYes: function () { saveQuietly({ moHelp: moHelp === 'lots' ? 'some' : 'ask', stepBackAsked: true }, 'Okay. Mo will step back a little.'); },
      stepBackNo: function () { self.setState({ stepBackAsked: true }); },
      showMeet: !!s.showMeet,
      meetList: meetItems.map(function (label, i) {
        var on = !!(s.meetTicks || {})[i];
        return { label: label, on: on, tick: function () { var m = Object.assign({}, s.meetTicks || {}); m[i] = !on; self.setState({ meetTicks: m }); } };
      }),
      meetClose: function () { self.setState({ showMeet: false }); },
      meetShareLabel: 'Share plan with ' + trusted,
      meetShare: function () { saveQuietly({ showMeet: false }, 'Plan shared with ' + trusted); },
      showEvFollow: !s.evFollow && !s.angryDebrief,
      evFollowText: 'How did the ' + pastEvent.title + ' go?',
      evFollowGood: function () { saveQuietly({ evFollow: 'good' }, 'Glad it went well.'); },
      evFollowOkay: function () { saveQuietly({ evFollow: 'okay' }, 'Thanks for telling me.'); },
      evFollowLow: go('angry', { evFollow: 'low', prevScreen: 'home' }),
      hideNav: screen === 'practice' || screen === 'dm' || !!s.showTextInput,
      hideMoFab: screen === 'practice' || screen === 'dm',
      showTextBar: screen === 'dm' || (screen === 'practice' && pStarted && !pBoundary && !pChoice),
      barIsDm: screen === 'dm',
      barValue: (screen === 'dm' ? dmDraft : pTyped) || '',
      barPlaceholder: screen === 'dm' ? 'Message ' + dmd.name : 'Reply to ' + ps.partner,
      barOnChange: screen === 'dm' ? function (e) { self.setState({ dmDraft: e.target.value, dmGentle: false, ideasOpen: e.target.value.trim() ? s.ideasOpen !== false : (moHelp === 'lots' ? true : s.ideasOpen !== false) }); } : function (e) { self.setState({ pTyped: e.target.value }); },
      barOnKey: function (e) { if (e.key === 'Enter') { e.preventDefault(); barSend(); } },
      barSend: barSend,
      kbVisible: !!s.keyboardOpen && (screen === 'dm' || (screen === 'practice' && pStarted && !pBoundary && !pChoice)),
      kbNum: !!s.kbNum, kbShift: kbShift,
      kbKey: function (ch) { setBar(barCur + ch); if (kbShift === 'on') self.setState({ kbShift: 'off' }); },
      kbBack: function () { setBar(barCur.slice(0, -1)); },
      kbSpace: function () { setBar(barCur + ' '); },
      kbShiftTap: function () {
        var now = Date.now(), dbl = now - (self._kbShiftAt || 0) < 350; self._kbShiftAt = now;
        self.setState({ kbShift: kbShift === 'off' ? 'on' : (kbShift === 'on' ? (dbl ? 'caps' : 'off') : 'off') });
      },
      kbNumToggle: function () { self.setState({ kbNum: !s.kbNum }); },
      kbReturn: function () { barSend(); self.setState({ keyboardOpen: false }); var a = document.activeElement; if (a && a.blur) a.blur(); },
      kbFocus: function () { self.setState({ keyboardOpen: true }); },
      kbBlur: function () { setTimeout(function () { if (!self._kbTap) self.setState({ keyboardOpen: false }); }, 150); },
      kbTapMark: function () { self._kbTap = true; setTimeout(function () { self._kbTap = false; }, 300); },
      kbDismiss: function () { if (s.keyboardOpen) { self.setState({ keyboardOpen: false }); var a = document.activeElement; if (a && a.blur) a.blur(); } },
      showCirclesRow: goalsArr.indexOf('meet') >= 0,
      peopleAfterPractice: goalsArr.indexOf('close') >= 0,
      peopleRows: [
        { key: 'fam', name: trusted, line: 'Talked 2 weeks ago', tint: '#FBE1D8' },
        { key: 'alex', name: 'Alex', line: 'Talked 5 days ago', role: 'roommate', tint: '#E3E0F8' },
        { key: 'jen', name: 'Jen', line: 'Talked yesterday', role: 'coworker', tint: '#D9EEE4' }
      ].map(function (p) {
        return { name: p.name, label: p.role ? p.name + ' · ' + p.role : p.name, line: p.line, tint: p.tint,
          sayHi: function () { var r = Object.assign({}, dmRead); r[p.key] = true; self.setState({ dm: p.key, screen: 'dm', dmRead: r, moOpen: false, dmGentle: false, dmIdeaSet: 0, ideasOpen: false, dmDraft: 'Hey ' + p.name + "! It's been a while. How's your week going?" }); } };
      }),
      showSayHi: !!s.sayHiName, sayHiText: s.sayHiText || '',
      sayHiHref: 'sms:?&body=' + encodeURIComponent(s.sayHiText || ''),
      setSayHiText: function (e) { self.setState({ sayHiText: e.target.value }); },
      sayHiOpenMsgs: function () { saveQuietly({ sayHiName: '' }, 'Nice. Mo will ask how it went later.'); },
      sayHiClose: function () { self.setState({ sayHiName: '' }); },
      gatePractice: go('practice', { pChoice: '', pStarted: false, showPracticeGate: false, dmCount: 1 }),
      gateChat: go('dm', { showPracticeGate: false, dmCount: 1 }),
      gateDismiss: function () { self.setState({ showPracticeGate: false }); },
      showMoNudge: !!s.showMoNudge,
      nudgeTalk: go('practice', { pChoice: 'boundary', showMoNudge: false }),
      nudgeOk: function () { self.setState({ showMoNudge: false }); },
      moOptions: [
        { path: 'M4 10 Q4 5 9 5 L15 5 Q20 5 20 10 L20 14 Q20 18 15 18 L13 18 L10 21 L10 18 L9 18 Q4 18 4 14 Z', iconBg: 'var(--soft2)', iconColor: 'var(--accent)', label: 'Practice with me', go: go('practice', { pChoice: '', pStarted: false }) },
        { path: 'M3 9h10a2.5 2.5 0 1 0-2.5-2.5M3 13h14a3 3 0 1 1-3 3M3 17h6', iconBg: '#EEF2FF', iconColor: '#7C6FAF', label: 'Breathe with me', go: go('reset', { trustSent: false, resetFrom: screen }) },
        { path: 'M12 3c3.5 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.5-6.5 6-11Z', iconBg: '#FEF3E8', iconColor: '#E8A44A', label: "I'm feeling low", go: go('angry', { prevScreen: screen, groundStep: null }) },
        { path: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.5v6M12 16.2v.3', iconBg: '#FEE8E8', iconColor: '#D96B6B', label: 'I need help', urgent: true, go: go('help', { helpSent: false, prevScreen: screen }) }
      ],
      moHelp: go('help', { helpSent: false, prevScreen: screen }),
      helpBack: go(s.prevScreen && s.prevScreen !== 'help' ? s.prevScreen : 'home')
    });
  }
}

class Bridge extends BridgeBase {
  startBreathe() {
    var self = this;
    this.stopBreathe();
    this.setState({ breatheSecondsLeft: 60, breathePhase: 'in', breathePhaseCount: 4, breatheActive: true });
    this._breathe = setInterval(function () {
      var left = (self.state.breatheSecondsLeft === undefined ? 60 : self.state.breatheSecondsLeft) - 1;
      if (left <= 0) { self.stopBreathe(); self.setState({ breatheSecondsLeft: 0, breatheActive: false, breathePhase: 'in', breathePhaseCount: 4 }); return; }
      // 11-second cycle: in 4s, hold 1s, out 6s
      var pos = (60 - left) % 11, ph, cnt;
      if (pos < 4) { ph = 'in'; cnt = 4 - pos; } else if (pos < 5) { ph = 'hold'; cnt = 1; } else { ph = 'out'; cnt = 11 - pos; }
      self.setState({ breatheSecondsLeft: left, breathePhase: ph, breathePhaseCount: cnt });
    }, 1000);
  }
  stopBreathe() { if (this._breathe) { clearInterval(this._breathe); this._breathe = null; } }
  componentDidMount() {
    var vv = window.visualViewport;
    var this_ = this;
    if (vv) {
      // Keyboard-aware: lift the fixed text bar by the keyboard height
      this._kb = function () {
        if (this_.state.keyboardOpen) return; // simulated keyboard owns the layout
        var kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        var bar = document.getElementById('text-input-bar');
        if (bar) bar.style.bottom = kb + 'px';
        document.documentElement.style.setProperty('--kb', kb + 'px');
        if (kb > 0) {
          var end = document.getElementById('dm-end');
          if (end) end.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      };
      vv.addEventListener('resize', this._kb);
      vv.addEventListener('scroll', this._kb);
    }
    var self = this; this._clock = setInterval(function () { self.setState({ clockTick: Date.now() }); }, 30000); }
  componentWillUnmount() {
    var vv = window.visualViewport;
    if (vv && this._kb) { vv.removeEventListener('resize', this._kb); vv.removeEventListener('scroll', this._kb); }
    this.stopBreathe(); if (this._clock) clearInterval(this._clock); }
  moHost(el) { return (el && el.closest && el.closest('.phone')) || document.documentElement; }
  moDown(e) {
    var host = this.moHost(e.currentTarget);
    this._drag = { sx: e.clientX, sy: e.clientY, ox: this.state.moX === undefined ? 299 : this.state.moX, oy: this.state.moY === undefined ? 21 : this.state.moY, dist: 0 };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    this.setState({ moDragging: true });
  }
  moMove(e) {
    var d = this._drag; if (!d || !this.state.moDragging) return;
    var host = this.moHost(e.currentTarget), W = host.clientWidth, H = host.clientHeight;
    var dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    d.dist = Math.max(d.dist, Math.sqrt(dx * dx + dy * dy));
    this.setState({ moX: Math.min(Math.max(d.ox + dx, 10), W - 70), moY: Math.min(Math.max(d.oy - dy, 21), H - 90) });
  }
  moUp(e) {
    var d = this._drag; if (!d) return;
    this._drag = null;
    var host = this.moHost(e.currentTarget), W = host.clientWidth, H = host.clientHeight;
    if (d.dist < 6) { this.setState({ moDragging: false, moX: d.ox, moY: d.oy, moOpen: !this.state.moOpen }); return; }
    var x = this.state.moX === undefined ? 299 : this.state.moX, y = this.state.moY === undefined ? 21 : this.state.moY;
    var corners = [[20, 100], [W - 91, 21], [20, H - 160], [W - 70, H - 160]];
    var best = corners[0], bd = Infinity;
    corners.forEach(function (c) { var dd = (c[0] - x) * (c[0] - x) + (c[1] - y) * (c[1] - y); if (dd < bd) { bd = dd; best = c; } });
    this.setState({ moDragging: false, moX: best[0], moY: best[1] });
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.screen !== this.state.screen && this.state.keyboardOpen) this.setState({ keyboardOpen: false });
    if (!!prevState.keyboardOpen !== !!this.state.keyboardOpen) {
      document.documentElement.style.setProperty('--kb', this.state.keyboardOpen ? '291px' : '0px');
      if (this.state.keyboardOpen) setTimeout(function () {
        var end = document.getElementById('dm-end'); var sc = document.querySelector('.screen-transition');
        if (end) end.scrollIntoView({ behavior: 'smooth', block: 'end' }); else if (sc) sc.scrollTo({ top: sc.scrollHeight, behavior: 'smooth' });
      }, 280);
    }
    if (prevState.onbStep !== this.state.onbStep || prevState.ciStep !== this.state.ciStep || prevState.pStep !== this.state.pStep) {
      window.scrollTo(0, 0);
      var stepEl = document.querySelector('.screen-transition');
      if (stepEl) stepEl.scrollTop = 0;
    }
    // Celebrate a new brave step: Mo hops once in the nav
    var countSteps = function (st) { return (st.won ? 1 : 0) + ((st.refl && st.refl.e0 && st.refl.e0.done) ? 1 : 0); };
    if (countSteps(this.state) > countSteps(prevState)) {
      var self = this;
      this.setState({ stepBump: Date.now() });
      setTimeout(function () { self.setState({ stepBump: 0 }); }, 2400);
    }
    if (prevState.screen !== this.state.screen && this.state.screen === 'reset') this.startBreathe();
    if (prevState.screen === 'reset' && this.state.screen !== 'reset') this.stopBreathe();
    if (prevState.screen !== this.state.screen) {
      // Mo's colour follows the emotional context of where the user went
      var nextScreen = this.state.screen, nextMood = 'calm';
      if (nextScreen === 'angry') nextMood = 'worried';
      else if (nextScreen === 'celebrate' || nextScreen === 'feedback' || nextScreen === 'win') nextMood = 'happy';
      else if (nextScreen !== 'checkin') nextMood = this.state.ciFeel === 'over' ? 'worried' : (this.state.ciFeel === 'ready' ? 'happy' : 'calm');
      if ((this.state.moMood || 'calm') !== nextMood) this.setState({ moMood: nextMood });
      // A toast from an earlier screen shouldn't follow you to the next one
      if (this.state.uiToast && prevState.undoToken === this.state.undoToken && prevState.uiToast === this.state.uiToast) {
        this.setState({ uiToast: '', undoPatch: null, undoToken: 0 });
      }
      var el = document.querySelector('.screen-transition');
      if (el && this.state.screen === 'me' && String(prevState.screen).indexOf('me-') === 0) {
        var saved = this.state.meScroll || 0;
        requestAnimationFrame(function () { el.scrollTop = saved; });
      } else if (el) el.scrollTop = 0;
      var order = { onboard: -1, checkin: 0, home: 1, circles: 2, circle: 3, dm: 3, notifs: 2, newEvent: 3, event: 3, practice: 3, feedback: 4, pause: 4, reset: 5, help: 4, me: 1, 'me-journey': 2, 'me-trusted': 2, 'me-profile': 2, 'me-colors': 2, 'me-comfort': 2, 'me-interests': 2, 'me-privacy': 2, win: 5, angry: 4, celebrate: 5 };
      var panel = document.querySelector('.screen-transition');
      if (panel && (order[this.state.screen] || 0) < (order[prevState.screen] || 0)) {
        panel.classList.add('screen-back');
      }
    }
  }
  renderView(v) {
    var peopleCard = (<div className="home-card" style={{display: "flex", flexDirection: "column", gap: "12px"}}>
<span style={{fontSize: "16px", fontWeight: "700", color: "var(--ink)"}}>My people</span>
{v.peopleRows.map((p, $i) => (<div key={$i} style={{display: "flex", alignItems: "center", gap: "12px"}}>
<PersonAvatar name={p.name} tint={p.tint} size={40} />
<div style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px"}}>
<span style={{fontSize: "16px", fontWeight: "600", color: "var(--ink)"}}>{p.label}</span>
<span style={{fontSize: "13px", color: "var(--muted)"}}>{p.line}</span>
</div>
<button onClick={p.sayHi} aria-label={"Say hi to " + p.name} style={{flex: "0 0 auto", border: "none", background: "var(--tint)", color: "var(--accent-dark)", borderRadius: "999px", padding: "8px 14px", fontSize: "13px", fontWeight: "600"}}>Say hi</button>
</div>))}
</div>);
    return (<MoGradientContext.Provider value={v.moGradient}>
<div className={v.appClass} style={{...v.themeVars, width: "100%", height: "100%", boxSizing: "border-box", background: v.rootBg, fontFamily: "Outfit, system-ui, sans-serif", color: "var(--ink)", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative"}}>
<div className="status-bar" style={{position: "fixed", top: "0", left: "0", right: "0", height: "44px", zIndex: "200", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", boxSizing: "border-box", background: v.statusBg}}>
<span style={{fontSize: "15px", fontWeight: "600", color: "var(--ink)"}}>{v.clockText}</span>
<div style={{display: "flex", alignItems: "center", gap: "6px"}}>
<svg width="16" height="16" viewBox="0 0 16 16" fill="#1E1B2E" aria-hidden="true"><rect x="0" y="10" width="3" height="3" rx="1"></rect><rect x="4.4" y="8" width="3" height="5" rx="1"></rect><rect x="8.8" y="6" width="3" height="7" rx="1"></rect><rect x="13.2" y="4" width="2.8" height="9" rx="1"></rect></svg>
<svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#1E1B2E" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M1 4.5a10 10 0 0 1 14 0"></path><path d="M3.5 7a6.5 6.5 0 0 1 9 0"></path><path d="M6 9.5a3 3 0 0 1 4 0"></path></svg>
<svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true"><rect x="0.75" y="0.75" width="21" height="10.5" rx="2" stroke="#1E1B2E" strokeWidth="1.5"></rect><rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="#1E1B2E"></rect><rect x="2.5" y="2.5" width="15.75" height="7" rx="1" fill="#1E1B2E"></rect></svg>
</div>
</div>
<div className="bridge-scroll" style={{flex: "1", minHeight: "0", overflow: "hidden", width: "100%"}}>
<div key={v.screenKey} className="screen-transition" onClick={v.kbDismiss}>

{v.isOnboard && (<>
<div className="onb">
<div className="onb-top">
{v.onbShowProgress && (<>
<button onClick={v.onbBack} aria-label="Back" className="onb-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg></button>
<div className="event-progress" style={{flex: "1"}}><div><i style={{width: v.onbPct}}></i></div><span>{v.onbStepText}</span></div>
</>)}
</div>

{v.onb1 && (<>
<div className="onb-body onb-center" style={{justifyContent: "space-between", paddingBottom: "0"}}>
<div style={{flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px"}}>
<div className="mo-breathe"><Mo mood="happy" size={100} /></div>
<h1 style={{margin: "0", fontSize: "32px", fontWeight: "700", color: "var(--ink)", textAlign: "center", maxWidth: "280px", lineHeight: "1.2"}}>Make friends at your own pace.</h1>
</div>
</div>
</>)}

{v.onb2 && (<>
<div className="onb-body">
<h1 className="onb-title">What are you into?</h1>
<span className="onb-sub">Pick at least one. Mo will suggest circles that match.</span>
<div className="interest-grid">
{v.interestOpts.map((o, $i) => (<React.Fragment key={$i}>
<button onClick={o.pick} aria-pressed={o.on} className="interest-tile" style={{boxShadow: o.ring}}>
<CircleGlyph kind={o.key} tint={o.tint} size={44} />
<span style={{flex: "1", fontSize: "16px", fontWeight: "600"}}>{o.name}</span>
{o.on && (<><span aria-hidden="true" className="tick">✓</span></>)}
</button>
</React.Fragment>))}
<button onClick={v.toggleOther} aria-pressed={v.otherOpen} className="interest-tile" style={{boxShadow: v.otherRing}}>
<span style={{width: "44px", height: "44px", borderRadius: "14px", background: "var(--soft)", display: "grid", placeItems: "center", flex: "0 0 auto"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg></span>
<span style={{flex: "1", fontSize: "16px", fontWeight: "600"}}>Something else ✏️</span>
{v.otherOpen && (<><span aria-hidden="true" className="tick">✓</span></>)}
</button>
</div>
{v.otherOpen && (<>
<label className="onb-field rise"><input type="text" autoFocus value={v.customInterest} onChange={v.setCustomInterest} placeholder="Type your interest…" aria-label="Your own interest" autoComplete="off" /></label>
</>)}
<span className="onb-sub">{v.interestCount}</span>
</div>
</>)}

{v.onb3 && (<>
<div className="onb-body" style={{paddingBottom: "60px"}}>
<h1 className="onb-title">Who can you count on?</h1>
<span className="onb-sub">When you tap "I need help", Mo texts this person. They never see your chats.</span>
{v.contactForms.map((f, $k) => (<React.Fragment key={$k}>
{f.idx > 0 && <h2 className="section-title" style={{margin: "10px 0 0"}}>Second person</h2>}
<label className="onb-field">Their name<input type="text" value={f.name} onChange={f.setName} placeholder="For example, Mom or Alex" autoComplete="off" /></label>
<label className="onb-field">Phone number<input type="tel" inputMode="tel" value={f.phone} onChange={f.setPhone} placeholder="(480) 555-0142" autoComplete="off" /></label>
{f.phoneHint && (<><span className="field-hint">{f.phoneHint}</span></>)}
<label className="onb-field">Email (optional)<input type="email" value={f.email} onChange={f.setEmail} placeholder="Backup if a text doesn't go through" autoComplete="off" /></label>
{f.emailHint && (<><span className="field-hint">{f.emailHint}</span></>)}
<span style={{fontSize: "15px", fontWeight: "600"}}>They are my</span>
<div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
{f.rels.map((o, $i) => (<React.Fragment key={$i}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "44px", borderRadius: "999px", border: "none", background: o.bg, color: o.fg, padding: "8px 16px", fontSize: "15px", fontWeight: "500", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>{o.label}</button>
</React.Fragment>))}
</div>
{f.showOther && (<><label className="onb-field rise"><input type="text" value={f.otherRole} onChange={f.setOther} placeholder="Type their role…" aria-label="Their role" autoComplete="off" /></label></>)}
</React.Fragment>))}
<span className="onb-sub" style={{textAlign: "left"}}>You can change this anytime in Me.</span>
</div>
</>)}

{v.onb4 && (<>
<div className="onb-body">
<h1 className="onb-title">Make it comfortable</h1>
<span className="onb-sub">Changes show right away. You can change them later in Me.</span>
<span style={{fontSize: "15px", fontWeight: "600"}}>Colors</span>
<div style={{display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px"}}>
{v.themeOpts.map((t, $index) => (<React.Fragment key={$index}>
<button onClick={t.pick} aria-pressed={t.on} aria-label={"Theme: " + t.name} style={{display: "flex", alignItems: "center", gap: "12px", border: t.on ? "2px solid var(--ink)" : "2px solid transparent", borderRadius: "16px", padding: "14px 16px", background: "#FFFFFF", boxShadow: t.on ? "none" : "0 1px 6px rgba(30,27,46,0.08)", color: "var(--ink)", textAlign: "left", transform: t.on ? "scale(1.06)" : "scale(1)", transition: "transform 0.2s ease, border-color 0.2s ease"}}>
<span style={{flex: "0 0 auto", width: "24px", height: "24px", borderRadius: "50%", background: t.dot}}></span>
<span style={{flex: "1", fontSize: "16px", fontWeight: "500"}}>{t.name}</span>
{t.on && (<><span aria-hidden="true" style={{fontSize: "15px"}}>✓</span></>)}
</button>
</React.Fragment>))}
</div>
<div className="comfort-card">
<div className="segmented-row"><span>Text size</span><Segments opts={v.sizeSeg} /></div>
<div className="segmented-row"><span style={v.calmOn ? {color: "var(--accent)", fontWeight: "600"} : null}>{v.calmOn ? "Calm mode · On" : "Calm mode"}</span><Segments opts={v.calmSeg} /></div>
{v.calmOn && (<>
<div className="calm-preview"><Mo mood="calm" size={20} /><span>Animations off · Quieter layout</span></div>
</>)}
<div className="segmented-row"><span>Chatting</span><Segments opts={v.chatSeg} /></div>
</div>
<div style={{display: "flex", gap: "12px", alignItems: "center", background: "#FFFFFF", borderRadius: "20px", padding: "12px 14px"}}><span style={{flex: "0 0 auto"}}><Mo mood="calm" size={40} /></span><span style={{fontSize: "14px", lineHeight: "1.4"}}>Calm mode turns off moving animations. Text first means circles and events start in text, and voice is always optional.</span></div>
<h2 className="section-title" style={{margin: "6px 0 0"}}>A few safety rules</h2>
<div className="onb-card">
<span className="safety-row"><b>1</b>Never share your address, passwords or money.</span>
<span className="safety-row"><b>2</b>If someone asks for secrets or money, Mo warns you privately.</span>
<span className="safety-row"><b>3</b>You can leave, mute or block anyone, anytime. They are not told why.</span>
<span className="safety-row"><b>4</b>Need help now? Tap Mo, then "I need help", or call 988.</span>
</div>
</div>
</>)}

<div className="onb-foot">
<button onClick={v.onbNext} style={{width: "100%", height: "56px", borderRadius: "999px", border: "none", background: v.onbNextBg, color: "#FFFFFF", fontSize: "16px", fontWeight: "600"}}>{v.onbNextLabel}</button>
</div>
{v.onb3 && v.canAddSecond && (<><button onClick={v.addSecond} className="add-person-link">+ Add another person</button></>)}
</div>
</>)}

{v.isCheckin && (<>
<div style={{minHeight: "100%", boxSizing: "border-box", padding: "20px 20px 40px", display: "flex", flexDirection: "column", gap: "12px"}}>
<div style={{display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "44px"}}>
{v.ciStep > 0 ? (<button onClick={v.ciBack} aria-label="Previous question" style={{width: "44px", height: "44px", borderRadius: "50%", border: "none", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg></button>) : <span></span>}
<div style={{display: "flex", gap: "8px"}} role="img" aria-label={"Question " + (v.ciStep + 1) + " of 3"}>
{v.ciDots.map((d, $i) => (<span key={$i} style={{width: "10px", height: "10px", borderRadius: "50%", background: d.bg, transition: "background 0.3s ease"}}></span>))}
</div>
</div>
<div key={v.ciStep} className="ci-step" style={{flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px", paddingBottom: "40px"}}>
<Mo mood="happy" size={60} />
<h1 style={{margin: "0", fontSize: "22px", fontWeight: "600", color: "var(--ink)", textAlign: "center", maxWidth: "290px", lineHeight: "1.3"}}>{v.ciQuestion}</h1>
<div style={{display: "flex", flexDirection: "column", gap: "10px", width: "100%"}}>
{v.ciStep === 0 && v.feelOpts.map((o, $i) => (<button key={$i} onClick={o.pick} aria-pressed={o.on} className="ci-chip" style={{background: o.on ? "var(--accent)" : "#FFFFFF", color: o.on ? "#FFFFFF" : "var(--ink)", border: "1.5px solid " + (o.on ? "var(--accent)" : "var(--border)"), transform: o.on ? "scale(1.03)" : "scale(1)", transition: "all 0.2s ease"}}>{o.label}</button>))}
{v.ciStep === 1 && v.upOpts.map((o, $i) => (<button key={$i} onClick={o.pick} aria-pressed={o.on} className="ci-chip" style={{background: o.on ? "var(--accent)" : "#FFFFFF", color: o.on ? "#FFFFFF" : "var(--ink)", border: "1.5px solid " + (o.on ? "var(--accent)" : "var(--border)"), transform: o.on ? "scale(1.03)" : "scale(1)", transition: "all 0.2s ease"}}>{o.label}</button>))}
{v.ciStep === 2 && v.hardOpts.map((o, $i) => (<button key={$i} onClick={o.pick} aria-pressed={o.on} className="ci-chip" style={{background: o.on ? "var(--accent)" : "#FFFFFF", color: o.on ? "#FFFFFF" : "var(--ink)", border: "1.5px solid " + (o.on ? "var(--accent)" : "var(--border)"), transform: o.on ? "scale(1.03)" : "scale(1)", transition: "all 0.2s ease"}}>{o.label}</button>))}
</div>
</div>
</div>
</>)}

{v.isHome && (<>
<div className="tab-screen">
<div className="tab-sticky-header" style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "20px 20px 0"}}>
<h1 style={{margin: "0", fontSize: "20px", fontWeight: "600", color: "var(--ink)", minWidth: "0"}}>{v.greeting}, {v.firstName}</h1>
<div style={{display: "flex", alignItems: "center", gap: "10px", flex: "0 0 auto"}}>
<span style={{background: "rgba(30,27,46,0.08)", borderRadius: "999px", padding: "6px 12px", fontSize: "13px", fontWeight: "500", color: "var(--ink)", whiteSpace: "nowrap"}}>{v.steps} {v.stepsWord}</span>
<button onClick={v.openNotifs} aria-label={v.notifLabel} style={{position: "relative", width: "36px", height: "36px", borderRadius: "50%", border: "none", padding: "0", background: "rgba(30,27,46,0.08)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 0 0 4 0"></path></svg>
{v.barNotifCount > 0 && (<><span className="badge-dot" style={{position: "absolute", top: "-2px", right: "-2px", width: "16px", height: "16px", borderRadius: "50%", background: "#E85D5D", color: "#FFFFFF", fontSize: "9px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1"}}>{v.barNotifCount}</span></>)}
</button>
</div>
</div>
<div className="tab-screen-content home-content">
<div className="home-card" style={{display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "12px"}}>
<div style={{flex: "0 0 auto", borderRadius: "50%", boxShadow: v.angryDebrief ? "0 0 0 4px #FFF0EA" : "none"}}><Mo mood={v.homeMood} size={48} /></div>
<div style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "10px"}}>
<div className="speech-bubble mo-bubble">{v.angryDebrief ? "How are you feeling now? Want to talk through what happened?" : v.showEvFollow ? v.evFollowText : (v.calmOn ? v.moLine.split(/(?<=[.!?])\s+/)[0] : v.moLine)}</div>
{v.showEvFollow && (<div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
<button onClick={v.evFollowGood} style={{height: "40px", borderRadius: "999px", border: "none", background: "var(--accent)", color: "#FFFFFF", fontSize: "14px", fontWeight: "500", padding: "0 18px"}}>Good</button>
<button onClick={v.evFollowOkay} style={{height: "40px", borderRadius: "999px", border: "none", background: "var(--tint)", color: "var(--accent-dark)", fontSize: "14px", fontWeight: "500", padding: "0 18px"}}>Okay</button>
<button onClick={v.evFollowLow} style={{height: "40px", borderRadius: "999px", border: "none", background: "var(--tint)", color: "var(--accent-dark)", fontSize: "14px", fontWeight: "500", padding: "0 18px"}}>Not great</button>
</div>)}
{v.angryDebrief && (<><button onClick={v.debriefTalk} style={{alignSelf: "flex-start", height: "40px", borderRadius: "999px", border: "none", background: "var(--accent)", color: "#FFFFFF", fontSize: "14px", fontWeight: "500", padding: "0 18px"}}>Yes, let's talk</button></>)}
</div>
</div>
{v.calmOn && (<>
<button onClick={v.goComfort} style={{alignSelf: "flex-start", border: "none", background: "var(--tint)", borderRadius: "999px", padding: "4px 12px", fontSize: "12px", color: "var(--accent)", marginTop: "-8px"}}>Calm mode on</button>
</>)}
{v.showStepBack && (<div className="home-card" style={{display: "flex", flexDirection: "column", gap: "12px"}}>
<span style={{fontSize: "16px", fontWeight: "600", color: "var(--ink)", lineHeight: "1.4"}}>You're getting confident! Want Mo to step back a little?</span>
<div style={{display: "flex", gap: "8px"}}>
<button onClick={v.stepBackYes} style={{border: "none", background: "var(--ink)", color: "#FFFFFF", borderRadius: "999px", padding: "8px 18px", fontSize: "14px", fontWeight: "600"}}>Yes</button>
<button onClick={v.stepBackNo} style={{border: "none", background: "var(--tint)", color: "var(--accent-dark)", borderRadius: "999px", padding: "8px 18px", fontSize: "14px", fontWeight: "600"}}>Not yet</button>
</div>
</div>)}
<div style={{background: "#FFFFFF", borderRadius: "20px", boxShadow: "0 2px 12px rgba(30,27,46,0.07)", padding: "16px 20px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: "12px"}}>
<div style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "4px"}}>
<span style={{fontSize: "12px", color: "var(--muted)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em"}}>Today's practice</span>
<span style={{fontSize: "17px", fontWeight: "700", color: "var(--ink)", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden"}}>{v.homeTodayTitle}</span>
{v.homePicked && (<><span style={{fontSize: "12px", color: "var(--accent)", fontWeight: "500"}}>• Picked for you</span></>)}
</div>
<button onClick={v.homeStart} style={{flex: "0 0 auto", background: "var(--ink)", color: "#FFFFFF", borderRadius: "999px", padding: "10px 18px", fontSize: "14px", fontWeight: "600", border: "none"}}>Start →</button>
</div>
{v.peopleAfterPractice && peopleCard}
{v.showCirclesRow && (<>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
<span style={{fontSize: "18px", fontWeight: "700", color: "var(--ink)"}}>Your circles</span>
<span style={{background: "var(--tint)", color: "var(--accent)", borderRadius: "999px", padding: "2px 10px", fontSize: "11px"}}>{v.homeActive} active now</span>
</div>
<div className="h-scroll">
{v.homeCircles.map((c, $i) => (<button key={$i} onClick={c.open} className="mini-circle">
<CircleGlyph kind={c.key} tint={c.iconBg} color={c.color} size={48} />
<span style={{fontSize: "16px", fontWeight: "600", color: "var(--ink)"}}>{c.name}</span>
{c.isNew && <span className="meta-pill" style={{fontSize: "11px", padding: "2px 8px"}}>New for you</span>}
<span className="mini-meta live-indicator"><i className="pulse-dot"></i>{c.here} here now</span>
</button>))}
</div>
</div>
</>)}
{!v.peopleAfterPractice && peopleCard}
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px"}}>
<span style={{fontSize: "16px", fontWeight: "700", color: "var(--ink)"}}>My plan this week</span>
<button onClick={v.togglePlanEdit} style={{border: "none", background: "transparent", padding: "0", fontSize: "13px", color: "var(--muted)"}}>{v.planEdit ? "Done" : "Edit →"}</button>
</div>
{v.planGoals.map((g, $i) => (<div key={$i} style={{background: "#FFFFFF", borderRadius: "14px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 1px 6px rgba(30,27,46,0.06)"}}>
<button onClick={g.toggle} role="checkbox" aria-checked={g.done} aria-label={g.text} style={{width: "22px", height: "22px", flex: "0 0 auto", padding: "0", border: "none", background: "transparent", display: "flex"}}><svg width="22" height="22" viewBox="0 0 22 22" fill={g.done ? "var(--accent)" : "none"} stroke={g.done ? "var(--accent)" : "var(--muted)"} strokeWidth="1.5" aria-hidden="true"><circle cx="11" cy="11" r="10"></circle>{g.done && <path d="M6.5 11.5l3 3 6-6.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>}</svg></button>
{v.planEdit ? <input value={g.text} onChange={g.setText} aria-label="Goal" style={{flex: "1", minWidth: "0", border: "none", borderBottom: "1.5px solid rgba(30,27,46,0.08)", background: "transparent", fontSize: "14px", fontWeight: "500", color: "var(--ink)", outline: "none", fontFamily: "inherit", padding: "2px 0"}} /> : <span style={{fontSize: "14px", fontWeight: "500", color: g.done ? "var(--muted)" : "var(--ink)", textDecoration: g.done ? "line-through" : "none"}}>{g.text}</span>}
</div>))}
</div>
</div>
</div>
</>)}

{v.isAngryScreen && (<>
<div className="pad-cta" style={{width: "100%", minHeight: "100%", boxSizing: "border-box", padding: "32px 20px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", background: "#FFF6ED"}}>
<div className="mo-pulse"><Mo mood="worried" size={72} /></div>
<h1 style={{margin: "0", fontSize: "26px", fontWeight: "700", color: "var(--ink)", textAlign: "center"}}>That's a big feeling.</h1>
<span style={{fontSize: "16px", color: "var(--muted)", textAlign: "center", marginTop: "-8px"}}>Let's slow things down together.</span>
<div style={{display: "flex", flexDirection: "column", gap: "12px", width: "100%"}}>
<button onClick={v.angryBreath} className="tap-card" style={{flexDirection: "row", alignItems: "center", gap: "14px"}}>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" style={{flex: "0 0 auto", stroke: "var(--accent)"}}><circle cx="12" cy="12" r="10"></circle><path d="M7.5 12a4.5 4.5 0 0 1 9 0"></path><path d="M10 14.5l2 2 2-2"></path></svg>
<span style={{display: "flex", flexDirection: "column", gap: "4px"}}>
<span style={{fontSize: "16px", fontWeight: "600", color: "var(--ink)"}}>Take a breath with me</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>A quick breathing exercise. 60 seconds.</span>
</span>
</button>
{!v.groundActive && !v.groundDone && (<>
<button onClick={v.groundStart} className="tap-card">
<span style={{fontSize: "16px", fontWeight: "600", color: "var(--ink)"}}>Ground yourself</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>Notice 5 things around you. Helps right now.</span>
</button>
</>)}
{v.groundActive && (<>
<div key={v.groundCount} className="tap-card ci-step" style={{cursor: "default", alignItems: "center", textAlign: "center", gap: "14px"}}>
<span className="pj-sub">{v.groundCount}</span>
<span style={{fontSize: "18px", fontWeight: "600", color: "var(--ink)"}}>{v.groundPrompt}</span>
<button onClick={v.groundNext} style={{height: "44px", padding: "0 24px", borderRadius: "999px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "15px", fontWeight: "500"}}>Next →</button>
</div>
</>)}
{v.groundDone && (<>
<div className="tap-card ci-step" style={{cursor: "default", alignItems: "center", textAlign: "center", gap: "14px"}}>
<span style={{fontSize: "16px", fontWeight: "500", color: "var(--safe)"}}>Nice. Your body is here. You're okay.</span>
<button onClick={v.groundBack} style={{height: "44px", padding: "0 24px", borderRadius: "999px", border: "none", background: "var(--soft)", color: "var(--ink)", fontSize: "15px", fontWeight: "500"}}>Back</button>
</div>
</>)}
<button onClick={v.angryLater} className="tap-card">
<span style={{fontSize: "16px", fontWeight: "600", color: "var(--ink)"}}>Talk it out later</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>Mo will check in with you after.</span>
</button>
</div>
<div style={{width: "100%", boxSizing: "border-box", background: "#FFFFFF", borderRadius: "20px", boxShadow: "0 2px 12px rgba(30,27,46,0.07)", padding: "16px 20px", marginTop: "20px", display: "flex", alignItems: "flex-start", gap: "12px"}}>
<Mo mood="calm" size={36} />
<span style={{fontSize: "14px", color: "var(--muted)", fontWeight: "400", lineHeight: "1.5"}}>Take your time. There's no rush here.</span>
</div>
<button onClick={v.angryBack} className="angry-exit"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9,4 4,8 9,12"/></svg>I'm feeling better</button>
</div>
</>)}

{v.isCelebrate && (<>
<div className="pad-cta" style={{width: "100%", minHeight: "100%", boxSizing: "border-box", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", background: "linear-gradient(160deg, var(--tint) 0%, var(--tint) 40%, var(--bg) 100%)"}}>
<div style={{position: "relative", width: "80px", height: "80px"}}>
{v.confetti.map((c, $i) => (<span key={$i} className={c.cls} style={{background: c.color, animationDelay: c.delay}}></span>))}
<svg className="rise" width="80" height="80" viewBox="0 0 24 24" style={{fill: "var(--accent)"}} aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
</div>
<h1 style={{margin: "0", fontSize: "32px", fontWeight: "800", color: "var(--ink)", textAlign: "center"}}>{v.lastBadge}</h1>
<span style={{fontSize: "16px", color: "var(--muted)", textAlign: "center", marginTop: "-8px"}}>Added to your collection</span>
<div className="sticky-cta"><button onClick={v.celebrateBadges}>See my badges</button></div>
<button onClick={v.celebrateHome} style={{border: "none", background: "transparent", color: "var(--muted)", fontSize: "15px", height: "44px"}}>Back to home</button>
</div>
</>)}

{v.isHelp && (<>
<div className="pad-cta" style={{width: "100%", minHeight: "100%", boxSizing: "border-box", padding: "32px 20px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", background: "var(--bg)"}}>
<Mo mood="worried" size={80} />
<h1 style={{margin: "0", fontSize: "28px", fontWeight: "600", color: "var(--ink)", textAlign: "center"}}>You're not alone.</h1>
<span style={{fontSize: "16px", color: "var(--muted)", textAlign: "center", marginTop: "-8px"}}>Pick what feels right.</span>
<div style={{background: "#FFFFFF", borderRadius: "20px", padding: "20px", width: "100%", boxSizing: "border-box", boxShadow: "0 2px 12px rgba(30,27,46,0.06)", display: "flex", flexDirection: "column", gap: "12px"}}>
<span style={{fontSize: "15px", fontWeight: "600", color: "var(--ink)"}}>Text someone I trust</span>
{v.helpNotSent && (<>
<div style={{background: "var(--soft)", borderRadius: "14px", padding: "12px 16px", fontSize: "15px", color: "var(--ink)", fontStyle: "italic"}}>Can you call me when you're free? I'm having a hard time.</div>
<button onClick={v.sendHelp} style={{width: "100%", height: "52px", borderRadius: "999px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "500"}}>Send to {v.trusted}</button>
</>)}
{v.helpSent && (<>
<span className="rise" style={{fontSize: "15px", fontWeight: "500", color: "var(--safe)", textAlign: "center"}}>Sent to {v.trusted}. Mo will stay with you until they reply.</span>
</>)}
</div>
<div style={{background: "#FFFFFF", borderRadius: "20px", padding: "20px", width: "100%", boxSizing: "border-box", boxShadow: "0 2px 12px rgba(30,27,46,0.06)", display: "flex", flexDirection: "column", gap: "12px"}}>
<span style={{fontSize: "15px", fontWeight: "600", color: "var(--ink)"}}>Talk to a crisis line</span>
<span className="pj-sub" style={{textAlign: "left"}}>Free, confidential, 24/7</span>
<a href="tel:988" style={{width: "100%", height: "52px", borderRadius: "999px", background: "var(--accent)", color: "#FFFFFF", fontSize: "16px", fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none"}}>Call or text 988</a>
</div>
<button onClick={v.helpBack} className="angry-exit"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9,4 4,8 9,12"/></svg>Back</button>
</div>
</>)}

{v.isCircles && (<>
<div className="tab-screen" style={{background: "var(--bg)"}}>
<div className="tab-sticky-header">
<h1 className="tab-page-title">Circles</h1>
<div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", background: "#FFFFFF", borderRadius: "999px", padding: "4px"}}>
{v.cTabs.map((t, $index) => (<React.Fragment key={$index}>
<button onClick={t.pick} style={{height: "42px", borderRadius: "999px", border: "none", background: t.bg, color: t.fg, fontSize: "15px", fontWeight: "600"}}>{t.label}</button>
</React.Fragment>))}
</div>
</div>
<div className="tab-screen-content circles-content">
{v.showCircleList && (<>
<div style={{display: "flex", gap: "12px", alignItems: "center", background: "#FFFFFF", borderRadius: "20px", padding: "12px 14px", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>
<Mo mood="happy" size={52} />
<span style={{fontSize: "16px", lineHeight: "1.4"}}>{v.circlesMoLine}</span>
</div>
<SlideToggle opts={v.filterOpts} />
<h2 style={{margin: "0", padding: "20px 0 12px", fontSize: "22px", fontWeight: "700", color: "var(--ink)"}}>Your circles</h2>
<div style={{display: "flex", flexDirection: "column", gap: "12px", padding: "0 0 120px"}}>
{v.circleCards.map((c, $index) => (<React.Fragment key={$index}>
<div className="circle-card" style={{background: "#FFFFFF", borderRadius: "24px", padding: "20px", boxShadow: "0 4px 20px rgba(30,27,46,0.09)"}}>
<div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px"}}>
<CircleGlyph kind={c.key} tint={c.iconBg} color={c.color} size={48} />
<div className="avatar-stack">{c.avatars.slice(0,3).map((name, i) => <PersonAvatar key={name} name={name} size={24} tint={i === 0 ? "#F9DCE4" : i === 1 ? "#E3E0F8" : "var(--tint)"} />)}</div>
</div>
<div style={{marginTop: "12px", fontSize: "20px", fontWeight: "700", color: "var(--ink)"}}>{c.name}</div>
<div className="live-indicator" style={{display: "flex", alignItems: "center", gap: "8px", marginTop: "4px"}}><i className="pulse-dot"></i><span style={{fontSize: "14px", color: "var(--muted)"}}>{c.here} here now</span></div>
<div className="topic-label tonight-topic" style={{marginTop: "12px"}}>Tonight's topic</div>
<div className="tonight-topic" style={{fontSize: "18px", fontWeight: "700", color: "var(--ink)", lineHeight: "1.3", marginTop: "4px"}}>{c.topic}</div>
<div style={{display: "flex", gap: "10px", marginTop: "16px"}}>
<button onClick={c.open} style={{flex: "1", height: "44px", borderRadius: "999px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "15px", fontWeight: "600"}}>Join chat</button>
<button onClick={c.read} style={{flex: "1", height: "44px", borderRadius: "999px", border: "none", background: "#F0EDE8", color: "var(--ink)", fontSize: "15px", fontWeight: "500"}}>Just read</button>
</div>
</div>
</React.Fragment>))}
</div>
</>)}
{v.showDmList && (<>
<span style={{fontSize: "14px", color: "var(--muted)", padding: "0 4px"}}>You can message people you've met in circles.</span>
{v.dmList.map((d, $index) => (<React.Fragment key={$index}>
<button onClick={d.open} style={{textAlign: "left", display: "flex", alignItems: "center", gap: "12px", background: "#FFFFFF", border: "none", borderRadius: "20px", padding: "12px 14px", color: "var(--ink)", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>
<span style={{flex: "0 0 auto", width: "48px", height: "48px", borderRadius: "50%", background: d.tint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "19px", fontWeight: "600"}}>{d.initial}</span>
<span style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px"}}>
<span style={{display: "flex", justifyContent: "space-between", gap: "8px"}}><span style={{fontSize: "17px", fontWeight: "600"}}>{d.name}</span><span style={{fontSize: "14px", color: "var(--muted)"}}>{d.from}</span></span>
<span style={{fontSize: "14px", color: "var(--muted)", fontWeight: d.weight, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{d.preview}</span>
</span>
<CircleGlyph kind={d.ckey} tint={d.iconBg} color={d.iconColor} size={32} />
{d.unread && (<><span aria-label="Unread" style={{flex: "0 0 auto", width: "10px", height: "10px", borderRadius: "50%", background: "#E0709A"}}></span></>)}
</button>
</React.Fragment>))}
<span style={{fontSize: "16px", fontWeight: "600", marginTop: "6px"}}>Message requests</span>
{v.reqPendingDm && (<>
<div style={{background: "#FBEDEA", borderRadius: "24px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px"}}>
<div style={{display: "flex", alignItems: "center", gap: "12px"}}>
<span style={{flex: "0 0 auto", width: "44px", height: "44px", borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "600"}}>A</span>
<div style={{display: "flex", flexDirection: "column"}}><span style={{fontSize: "16px", fontWeight: "600"}}>Alex</span><span style={{fontSize: "14px", color: "var(--muted)"}}>Anime circle · you haven't talked yet</span></div>
</div>
<div style={{display: "flex", gap: "10px", alignItems: "flex-start"}}>
<Mo mood="worried" size={40} />
<span style={{fontSize: "14px", lineHeight: "1.4"}}>Mo held this message. Alex is asking for money and to keep it secret. That's not safe.</span>
</div>
<div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px"}}>
<button onClick={v.reqReport} style={{height: "44px", borderRadius: "16px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "15px", fontWeight: "500"}}>Report and block</button>
<button onClick={v.reqDelete} style={{height: "44px", borderRadius: "16px", border: "none", background: "#FFFFFF", color: "var(--ink)", fontSize: "15px", fontWeight: "500"}}>Delete</button>
</div>
</div>
</>)}
{v.reqDone && (<>
<span style={{fontSize: "14px", color: "var(--accent-dark)", padding: "0 4px"}}>{v.reqDoneText}</span>
</>)}
</>)}
</div>
</div>
</>)}

{v.isCircle && (<>
<div style={{display: "flex", flexDirection: "column", minHeight: "100%"}}>
<div style={{padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: "10px"}}>
<div className="sticky-header inner-header" style={{display: "flex", alignItems: "center", gap: "12px"}}>
<button onClick={v.goCircles} aria-label="Back to circles" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<div style={{display: "flex", flexDirection: "column", flex: "1"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>{v.cName} circle</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>{v.cTopic}</span>
</div>
<button onClick={v.toggleMenu} aria-label="Safety options" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z"></path></svg>
</button>
</div>
{v.menuOpen && (<>
<div style={{display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px"}}>
<button onClick={v.doReport} style={{height: "52px", borderRadius: "999px", border: "none", background: "#FFFFFF", color: "var(--ink)", fontSize: "15px", fontWeight: "500"}}>Report chat</button>
<button onClick={v.doBlock} style={{height: "52px", borderRadius: "999px", border: "none", background: "#FFFFFF", color: "var(--ink)", fontSize: "15px", fontWeight: "500"}}>Block member</button>
</div>
</>)}
{v.hasSafetyNote && (<>
<span style={{fontSize: "14px", textAlign: "center", color: "var(--accent-dark)"}}>{v.safetyNote}</span>
</>)}
<div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
{v.hasEvToast && (<>
<div className="rise" style={{display: "flex", gap: "10px", alignItems: "center", background: "#E4F1F0", borderRadius: "20px", padding: "10px 14px"}}>
<Mo mood="happy" size={36} />
<span style={{fontSize: "14px", lineHeight: "1.4", color: "var(--accent-dark)"}}>{v.evToast}</span>
</div>
</>)}
{v.circleEvents.map((ev, $index) => (<React.Fragment key={$index}>
<div className="event-row-card"><DateTile day={ev.day} date={ev.date}/><button onClick={ev.open} className="event-copy" style={{border:0,background:"transparent",textAlign:"left",padding:0,color:"var(--ink)"}}><strong>{ev.title}</strong><span>{ev.when}</span><span>{ev.where}</span><span className="meta-pill">{ev.meta}</span></button>{ev.notMine ? <button onClick={ev.toggle} style={{height:"38px",border:0,borderRadius:"13px",background:ev.inBg,color:ev.inFg,padding:"0 9px",fontWeight:"600"}}>{ev.inLabel}</button> : <span style={{fontSize:"14px",color:"var(--muted)"}}>Hosting</span>}</div>
</React.Fragment>))}
<button onClick={v.newEventCircle} style={{alignSelf: "flex-start", height: "38px", borderRadius: "999px", border: "1.5px dashed #B7C2BA", background: "transparent", color: "var(--ink)", padding: "0 14px", fontSize: "14px", fontWeight: "500"}}>+ Plan an event in {v.cName}</button>
</div>
</div>

<div style={{flex: "1", padding: "12px 20px 16px", display: "flex", flexDirection: "column", gap: "14px"}}>
<div className="today-divider">Today</div>
<div className="chat-group">
<PersonAvatar name={v.m1Name} size={28} tint="#F9DCE4" onClick={v.m1CanDm ? v.m1Dm : null} />
<div><span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.m1Name}</span><div style={{background: "#FFFFFF", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "82%", fontSize: "17px", lineHeight: "1.45"}}>{v.m1Text}</div><div className="chat-meta">7:38 PM</div></div>
</div>
<div className="chat-group">
<PersonAvatar name={v.m2Name} size={28} tint="#E3E0F8" onClick={v.m2CanDm ? v.m2Dm : null} />
<div><span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.m2Name}</span><div style={{background: "#FFFFFF", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "82%", fontSize: "17px", lineHeight: "1.45"}}>{v.m2Text}</div><div className="chat-meta">7:42 PM</div></div>
</div>
{v.hasUnsafe && (<>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<div className="chat-group"><PersonAvatar name={v.m3Name} size={28} tint="#FBE1D8" /><div><span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.m3Name} · new member</span><div style={{background: "#FFFFFF", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "82%", fontSize: "17px", lineHeight: "1.45"}}>{v.m3Text}</div><div className="chat-meta">7:43 PM</div></div>
</div>
{v.showUnsafeCard && (<>
<div className="rise" style={{background: "#FBEDEA", borderRadius: "24px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px"}}>
<div style={{display: "flex", gap: "12px", alignItems: "center"}}>
<Mo mood="worried" size={52} />
<span style={{fontSize: "16px", lineHeight: "1.4"}}>Only you can see this. {v.m3Name} is asking for money and to keep it secret. That's not safe.</span>
</div>
<div style={{display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px"}}>
<button onClick={v.unsafeReport} style={{height: "52px", borderRadius: "999px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "15px", fontWeight: "500"}}>Report Alex</button>
<button onClick={v.unsafeBlock} style={{height: "52px", borderRadius: "999px", border: "none", background: "#FFFFFF", color: "var(--ink)", fontSize: "15px", fontWeight: "500"}}>Block Alex</button>
<button onClick={v.unsafeIgnore} style={{height: "46px", borderRadius: "16px", border: "none", background: "transparent", color: "var(--ink)", fontSize: "15px", fontWeight: "600"}}>Not now</button>
</div>
</div>
</>)}
</div>
</>)}

{v.isSent && (<>
<div style={{display: "flex", flexDirection: "column", gap: "14px"}}>
<div className="chat-group me"><div><div style={{alignSelf: "flex-end", background: "var(--ink)", color: "#FFFFFF", borderRadius: "24px 24px 8px 24px", padding: "13px 17px", maxWidth: "100%", fontSize: "17px", lineHeight: "1.45"}}>{v.sentText}</div><div className="chat-meta">Seen · 7:44 PM</div></div></div>
<div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
<div className="chat-group"><PersonAvatar name={v.m2Name} size={28} tint="#E3E0F8" /><div><span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.m2Name}</span><div style={{background: "#FFFFFF", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "82%", fontSize: "17px", lineHeight: "1.45"}}>{v.jordanReply}</div><div className="chat-meta">7:45 PM</div></div></div>
</div>
<div className="rise" style={{background: "#FFFFFF", borderRadius: "20px", padding: "16px", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>
<div style={{flex: "0 0 auto"}}><Mo mood={v.resultMood} size={64} /></div>
<div style={{display: "flex", flexDirection: "column", gap: "10px", flex: "1"}}>
<p style={{margin: "0", fontSize: "16px", lineHeight: "1.4"}}>{v.resultLine}</p>
<button onClick={v.resultAction} style={{height: "52px", borderRadius: "999px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "500"}}>{v.resultButton}</button>
{v.hasUndo && <button onClick={v.undoToast} className="quiet-action" style={{minHeight: "32px"}}>Undo send</button>}
</div>
</div>
</div>
</>)}

{v.isReadOnly && (<>
<div style={{marginTop: "auto", background: "#FFFFFF", borderRadius: "20px", padding: "14px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>
<Mo mood="calm" size={44} />
<span style={{flex: "1", fontSize: "15px", lineHeight: "1.4"}}>Reading quietly counts. Say hi only if you want to.</span>
<button onClick={v.stopReading} style={{height: "44px", borderRadius: "16px", border: "none", background: "var(--ink)", color: "#FFFFFF", padding: "0 14px", fontSize: "15px", fontWeight: "500"}}>Say hi</button>
</div>
</>)}

{v.showSuggest && (<>
<div style={{marginTop: "auto", background: "#FFFFFF", borderRadius: "20px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>
<div style={{display: "flex", alignItems: "center", gap: "10px"}}>
<Mo mood="happy" size={40} />
<span style={{fontSize: "16px", fontWeight: "500"}}>Want a reply idea?</span>
</div>
<div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
<button className="idea-chip" onClick={v.chipAsk} style={{minHeight: "44px", borderRadius: "999px", border: "none", background: "#FFFFFF", padding: "8px 16px", fontSize: "15px", color: "var(--ink)"}}>Ask {v.m2Name} a question</button>
<button className="idea-chip" onClick={v.chipShare} style={{minHeight: "44px", borderRadius: "999px", border: "none", background: "#FFFFFF", padding: "8px 16px", fontSize: "15px", color: "var(--ink)"}}>Share my own</button>
{v.isGaming && (<>
<button className="idea-chip" onClick={v.chipOwn} style={{minHeight: "44px", borderRadius: "999px", border: "none", background: "var(--soft)", padding: "8px 16px", fontSize: "15px", color: "var(--ink)"}}>Write my own</button>
</>)}
</div>
</div>
</>)}
</div>

{v.showMoNudge && (<>
<div className="rise mo-nudge" style={{background: "#FFFFFF", borderRadius: "20px", padding: "14px 16px", margin: "0 20px 8px", boxShadow: "0 2px 12px rgba(30,27,46,0.06)", display: "flex", alignItems: "flex-start", gap: "12px"}}>
<Mo mood="worried" size={36} />
<div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
<span style={{fontSize: "15px", color: "var(--ink)", lineHeight: "1.4"}}>That message felt off. You don't have to reply. Want to talk about it?</span>
<div style={{display: "flex", gap: "8px"}}>
<button onClick={v.nudgeTalk} style={{height: "36px", borderRadius: "999px", border: "none", background: "var(--accent)", color: "#FFFFFF", fontSize: "14px", padding: "0 14px"}}>Yes, let's talk</button>
<button onClick={v.nudgeOk} style={{height: "36px", borderRadius: "999px", border: "none", background: "var(--soft)", color: "var(--ink)", fontSize: "14px", padding: "0 14px"}}>I'm okay</button>
</div>
</div>
</div>
</>)}
{v.showComposer && (<>
<div style={{padding: "10px 20px 18px", display: "flex", flexDirection: "column", gap: "8px"}}>
{v.hasDraft && (<>
<span style={{alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px", background: v.toneBg, borderRadius: "999px", padding: "6px 14px", fontSize: "14px", color: "var(--ink)"}}><span style={{width: "8px", height: "8px", borderRadius: "50%", background: v.toneDot, display: "inline-block"}}></span>{v.toneLabel}</span>
{v.hasToneWhy && (<><span className="why-line">{v.toneWhy}</span></>)}
</>)}
<div style={{display: "flex", gap: "10px", alignItems: "center"}}>
<div style={{flex: "1", minHeight: "52px", borderRadius: "20px", background: "#FFFFFF", boxShadow: v.draftRing, padding: "12px 18px", display: "flex", alignItems: "center", fontSize: "16px", color: v.draftColor, lineHeight: "1.35"}}>{v.draftShown}</div>
<button onClick={v.send} aria-label={"Send to " + v.cName + " chat"} style={{width: "52px", height: "52px", flex: "0 0 auto", borderRadius: "50%", border: "none", background: v.sendBg, display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{stroke: v.sendIcon}} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"></path></svg>
</button>
</div>
</div>
</>)}
</div>
</>)}

{v.isNewEvent && (<>
<div className="sticky-header inner-header">
<button onClick={v.evPrev} aria-label="Back" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<span className="header-title">Create event</span><span></span>
</div>
<div className="event-step-shell">
<div className="event-progress"><span>{v.evStepLabel}</span><div><i style={{width: (v.evStep / 3 * 100) + '%'}}></i></div></div>
{v.evStep === 1 && <>
<span className="field-label">What & when</span>
<span style={{fontSize:"14px",fontWeight:"600"}}>Host it in</span>
<div className="horizontal-scroll">
{v.hostOpts.map((o, $index) => (<React.Fragment key={$index}>
<button className={"choice-pill " + (o.on ? "on" : "")} onClick={o.pick} aria-pressed={o.on}>{o.label}</button>
</React.Fragment>))}
</div>
<label style={{display:"flex",flexDirection:"column",gap:"7px"}}><span style={{fontSize:"14px",fontWeight:"600"}}>Event name</span><input className="event-input" value={v.evPreview.split(' · ')[0]} onChange={v.setEvWhat} /></label>
<div className="horizontal-scroll">
{v.whatOpts.map((o, $index) => (<React.Fragment key={$index}>
<button className={"choice-pill " + (o.on ? "on" : "")} onClick={o.pick}>{o.label}</button>
</React.Fragment>))}
</div>
<span style={{fontSize:"14px",fontWeight:"600"}}>Date</span>
<div className="week-strip">{v.weekDays.map((d,i)=><button className={"day-button "+(d.on?"on":"")} onClick={d.pick} key={i}><small>{d.day}</small><strong>{d.date}</strong></button>)}</div>
<button onClick={v.toggleCalendar} style={{alignSelf:"flex-start",border:0,background:"transparent",fontWeight:"600",padding:"2px"}}>Pick another date ›</button>
{v.showCalendar && <div style={{background:"#FFFFFF",borderRadius:"20px",padding:"14px"}}><strong>June 2025</strong><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"5px",marginTop:"10px"}}>{[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(n=><button key={n} onClick={v.toggleCalendar} style={{height:"34px",border:0,borderRadius:"10px",background:n===9?"var(--ink)":"transparent",color:n===9?"#fff":"var(--ink)"}}>{n}</button>)}</div></div>}
<span style={{fontSize:"14px",fontWeight:"600"}}>Start time</span>
<div className="horizontal-scroll">{v.timeOpts.map((o,i)=><button key={i} className={"choice-pill "+(o.on?"on":"")} onClick={o.pick}>{o.label}</button>)}</div>
<div className="segmented-row"><span>Duration</span><Segments opts={v.durationOpts} /></div>
<div style={{background:"#FFFFFF",borderRadius:"16px",padding:"12px",fontWeight:"600"}}>{v.evTimeRange}</div>
{v.hasClash ? <div role="status" style={{display:"flex",gap:"10px",alignItems:"center",background:"#FBEDEA",borderRadius:"18px",padding:"12px"}}><Mo mood="calm" size={38}/><span>{v.evClash}</span></div> : <div style={{display:"flex",gap:"10px",alignItems:"center",background:"var(--soft)",borderRadius:"18px",padding:"12px"}}><Mo mood="happy" size={38}/><span>Shorter is easier the first time.</span></div>}
</>}
{v.evStep === 2 && <>
<span className="field-label">Where & vibe</span>
<Segments opts={v.modeOpts} />
{v.evInPerson ? <>
<input className="event-input" placeholder="Search a place" aria-label="Search a place" />
{v.venueOpts.map((venue,i)=><button key={i} className={"venue-card "+(venue.on?"on":"")} onClick={venue.pick}><MapThumb/><span><strong>{venue.name}</strong><small>{venue.address} · {venue.distance}</small><small className="quiet-tag">{venue.quiet}</small></span></button>)}
</> : <>
<div className="horizontal-scroll">{v.onlineOpts.map((o,i)=><button key={i} className={"choice-pill "+(o.on?"on":"")} onClick={o.pick}>{o.label}</button>)}</div>
<div style={{background:"var(--soft)",borderRadius:"16px",padding:"12px"}}>Bridge creates the link.</div>
</>}
<div className="segmented-row"><span>Sound</span><Segments opts={v.soundOpts} /></div>
<div className="segmented-row"><span>Lighting</span><Segments opts={v.lightOpts} /></div>
{v.evInCircle && <div className="segmented-row"><span>Group size</span><div className="stepper"><button onClick={v.groupDown}>−</button><strong>{v.evGroupSize}</strong><button onClick={v.groupUp}>+</button></div></div>}
</>}
{v.evStep === 3 && <>
<span className="field-label">Who & review</span>
{v.evIsOutside ? <>{v.inviteOpts.map((o,i)=><div className="invite-row" key={i}><PersonAvatar name={o.label} size={40} tint={i%2?"#E3E0F8":"#F9DCE4"}/><span>{o.label}</span><button className={"check-box "+(o.on?"on":"")} onClick={o.pick}>{o.on?"✓":""}</button></div>)}</> : <div style={{background:"var(--soft)",borderRadius:"18px",padding:"14px"}}>Everyone in the circle can see this event.</div>}
<span style={{fontSize:"14px",fontWeight:"600"}}>Remind me</span>
<Segments opts={v.remindOpts} />
{v.evInPerson && <button className={"choice-pill "+(v.shareLabel.indexOf('✓')>=0?"on":"")} onClick={v.toggleShare}>{v.shareLabel}</button>}
<span style={{fontSize:"14px",color:"var(--muted)",letterSpacing:"1px"}}>PREVIEW</span>
<div className="event-row-card"><DateTile day={v.weekDays.filter(d=>d.on)[0].day} date={v.weekDays.filter(d=>d.on)[0].date}/><div className="event-copy"><strong>{v.evPreview.split(' · ')[0]}</strong><span>{v.evTimeRange}</span><span>{v.evPreviewWhere}</span><span className="meta-pill">{v.evPreviewSize}</span></div></div>
</>}
</div>
<div className="sticky-cta"><button onClick={v.evStep === 3 ? v.createEvent : v.evNext}>{v.evStep === 3 ? 'Create event' : 'Next'}</button></div>
</>)}

{v.isDm && (<>
<div className="text-screen" style={{display: "flex", flexDirection: "column", minHeight: "100%"}}>
<div className="sticky-header inner-header" style={{padding: "20px 20px 8px", display: "flex", alignItems: "center", gap: "12px"}}>
<button onClick={v.dmBack} aria-label="Back to messages" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<div style={{display: "flex", flexDirection: "column", textAlign:"center"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>{v.dmName}</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>{v.dmFrom}</span>
</div>
<PersonAvatar name={v.dmName} tint={v.dmTint} size={40} />
</div>
<div style={{flex: "1", padding: "12px 20px 12px", display: "flex", flexDirection: "column", gap: "10px"}}>
<div className="today-divider">Today</div>
{v.dmMessages.map((m, $index) => (<React.Fragment key={$index}>
<div className={"chat-group " + (m.me ? "me" : "")} style={{alignSelf: m.align}}>
{m.showAvatar && <PersonAvatar name={v.dmName} tint={v.dmTint} size={28} />}
<div><div style={{background: m.bg, color: m.fg, borderRadius: m.radius, padding: "12px 16px", maxWidth: "100%", fontSize: "16px", lineHeight: "1.45"}}>{m.text}</div>{m.lastInGroup && <div className="chat-meta">{m.seen ? 'Seen · ' : ''}{m.time || '7:40 PM'}</div>}</div>
</div>
</React.Fragment>))}
{v.dmTyping && <div className="chat-group" style={{alignSelf: "flex-start"}}><PersonAvatar name={v.dmName} tint={v.dmTint} size={28} /><div className="typing-dots" role="status" aria-label={v.dmName + " is typing"}><i></i><i></i><i></i></div></div>}
{v.showIdeaPill && (<div style={{marginTop: "auto", padding: "8px 16px 6px", display: "flex"}}><button onClick={v.openIdeas} style={{border: "none", background: "var(--tint)", color: "var(--accent-dark)", borderRadius: "999px", padding: "8px 14px", fontSize: "14px", fontWeight: "600"}}>Need an idea?</button></div>)}
<div id="dm-end"></div>
{v.showDmIdeas && (<>
<div className={v.noShimmer ? "no-shimmer" : ""} style={{marginTop: "auto", background: "var(--bg)", borderTop: "1px solid var(--border)", padding: "10px 16px 6px", display: "flex", flexDirection: "column", gap: "8px"}}>
<div style={{display: "flex", alignItems: "center", gap: "6px"}}><Mo mood="happy" size={20} /><span className="pj-sub" style={{fontSize: "12px", fontWeight: "500"}}>Mo's ideas · tap to use</span></div>
<div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
{v.dmIdeas.map((i, $index) => (<React.Fragment key={$index}>
<button className="idea-chip" onClick={i.pick} style={{background: "#FFFFFF", border: "1.5px solid var(--border)", borderRadius: "999px", padding: "8px 14px", fontSize: "14px", color: "var(--ink)", textAlign: "left"}}>{i.label}</button>
</React.Fragment>))}
</div>
<button onClick={v.moreIdeas} style={{alignSelf: "flex-end", border: "none", background: "transparent", fontSize: "13px", color: "var(--accent)", padding: "4px 0"}}>More ideas</button>
</div>
</>)}
</div>
<div className="dm-composer" style={{padding: "6px 20px 16px", display: "flex", flexDirection: "column", gap: "8px"}}>
{v.dmHarsh && (<>
<div className="rise" style={{background: "#FBEDEA", borderRadius: "20px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px"}}>
<div style={{display: "flex", gap: "8px", alignItems: "center"}}><Mo mood="worried" size={32} /><span style={{fontSize: "14px", lineHeight: "1.35"}}>This might sound harsh to {v.dmName}.</span></div>
<span className="why-line">{v.dmWhy}</span>
<div style={{display: "flex", gap: "8px"}}>
<button onClick={v.dmSayGently} style={{flex: "1", height: "40px", borderRadius: "14px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "14px", fontWeight: "500"}}>Say it gently</button>
<button onClick={v.dmSendAnyway} style={{flex: "1", height: "40px", borderRadius: "14px", border: "none", background: "#FFFFFF", color: "var(--ink)", fontSize: "14px"}}>Send anyway</button>
</div>
</div>
</>)}
</div>
</div>
</>)}

{v.isNotifs && (<>
<div style={{padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: "12px"}}>
<div className="sticky-header inner-header" style={{display: "flex", alignItems: "center", gap: "12px"}}>
<button onClick={v.notifBack} aria-label="Back" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<h1 style={{margin: "0", fontSize: "24px", fontWeight: "600"}}>Notifications</h1>
</div>
<div style={{display: "flex", gap: "12px", alignItems: "center", background: "#FFFFFF", borderRadius: "20px", padding: "12px 14px"}}>
<Mo mood="calm" size={40} />
<span style={{flex: "1", fontSize: "14px", lineHeight: "1.4"}}>{v.notifMoLine}</span>
</div>
<button onClick={v.togglePause} style={{alignSelf: "flex-start", minHeight: "42px", borderRadius: "999px", border: "none", background: v.pauseBg, color: v.pauseFg, padding: "8px 16px", fontSize: "15px"}}>{v.pauseLabel}</button>
<span style={{fontSize: "16px", fontWeight: "600", marginTop: "4px"}}>New</span>
{v.notifNew.map((n, $index) => (<React.Fragment key={$index}>
<button onClick={n.open} style={{textAlign: "left", display: "flex", gap: "12px", alignItems: "flex-start", background: "#FFFFFF", border: "none", borderRadius: "20px", padding: "14px", color: "var(--ink)", boxShadow: "0 10px 26px rgba(30,27,46,0.08)"}}>
<span style={{flex: "0 0 auto", width: "40px", height: "40px", borderRadius: "14px", background: "var(--soft)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={n.path}></path></svg>
</span>
<span style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px"}}>
<span style={{display: "flex", justifyContent: "space-between", gap: "8px"}}><span style={{fontSize: "16px", fontWeight: "600", lineHeight: "1.3"}}>{n.title}</span><span style={{flex: "0 0 auto", fontSize: "14px", color: "var(--muted)"}}>{n.time}</span></span>
<span style={{fontSize: "14px", lineHeight: "1.4", color: "var(--muted)"}}>{n.body}</span>
</span>
{n.isNew && (<><span aria-label="New" style={{flex: "0 0 auto", width: "10px", height: "10px", borderRadius: "50%", background: "#E0709A", marginTop: "6px"}}></span></>)}
</button>
</React.Fragment>))}
<span style={{fontSize: "16px", fontWeight: "600", marginTop: "4px"}}>Earlier</span>
{v.notifEarlier.map((n, $index) => (<React.Fragment key={$index}>
<button onClick={n.open} style={{textAlign: "left", display: "flex", gap: "12px", alignItems: "flex-start", background: "#FFFFFF", border: "none", borderRadius: "20px", padding: "14px", color: "var(--ink)", boxShadow: "0 10px 26px rgba(30,27,46,0.08)"}}>
<span style={{flex: "0 0 auto", width: "40px", height: "40px", borderRadius: "14px", background: "var(--soft)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={n.path}></path></svg>
</span>
<span style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px"}}>
<span style={{display: "flex", justifyContent: "space-between", gap: "8px"}}><span style={{fontSize: "16px", fontWeight: "600", lineHeight: "1.3"}}>{n.title}</span><span style={{flex: "0 0 auto", fontSize: "14px", color: "var(--muted)"}}>{n.time}</span></span>
<span style={{fontSize: "14px", lineHeight: "1.4", color: "var(--muted)"}}>{n.body}</span>
</span>
{n.isNew && (<><span aria-label="New" style={{flex: "0 0 auto", width: "10px", height: "10px", borderRadius: "50%", background: "#E0709A", marginTop: "6px"}}></span></>)}
</button>
</React.Fragment>))}
</div>
</>)}

{v.isEvent && (<>
<div style={{padding: "20px 20px 116px", display: "flex", flexDirection: "column", gap: "14px"}}>
<div className="sticky-header inner-header" style={{display: "flex", alignItems: "center", gap: "12px"}}>
<button onClick={v.edBack} aria-label="Back" style={{width: "44px", height: "44px", flex: "0 0 auto", borderRadius: "16px", border: "none", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<span className="header-title">Event details</span><span></span>
</div>
<div className="event-cover" style={{background:v.edTint}}><CircleGlyph kind={v.edIcon} tint="#FFFFFF" size={52}/><span><strong style={{display:"block",fontSize:"18px"}}>{v.edHost}</strong><small style={{color:"var(--muted)"}}>Bridge event</small></span></div>
<div className="event-hero-card">
<h1 style={{margin: "0", fontSize: "27px", fontWeight: "600", lineHeight: "1.2"}}>{v.edTitle}</h1>
<span className="meta-pill">{v.edMeta}</span>
<div className="event-fact"><DateTile day={v.edDateDay} date={v.edDateNum}/><div><strong>{v.edTimeRange}</strong>{v.edWhen !== v.edTimeRange && <small>{v.edWhen}</small>}</div></div>
{v.edInPerson ? <div className="venue-detail"><div><strong>{v.edVenue}</strong><span style={{fontSize:"14px",color:"var(--muted)"}}>{v.edAddress}</span></div><MapThumb/><div className="venue-actions"><button onClick={v.edDirections}>Directions</button><button onClick={v.edCopyAddress}>Copy address</button></div></div> : <div style={{background:"var(--soft)",borderRadius:"18px",padding:"14px"}}>{v.edPast ? "This event has ended." : "Join link available 10 min before."}</div>}
<div style={{display:"flex",justifyContent:"space-between",gap:"8px",fontSize:"14px"}}><span>{v.edHostedBy}</span><span>{v.edSpots}</span></div>
<div className="utility-buttons"><button onClick={v.edAddCalendar}>Add to calendar</button><button onClick={v.edShare}>Share</button></div>
</div>

<div style={{background: "#FFFFFF", borderRadius: "20px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>
<span style={{fontSize: "17px", fontWeight: "600"}}>What to expect</span>
<div style={{display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px"}}>
{v.edSense.map((x, $index) => (<React.Fragment key={$index}>
<div style={{background: "var(--soft)", borderRadius: "18px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={x.path}></path></svg>
<span style={{fontSize: "14px", color: "var(--muted)"}}>{x.label}</span>
{x.level > 0 && <span className="sense-meter" aria-label={x.label + ": " + x.levelWord}>{[1, 2, 3].map(n => <i key={n} className={n <= x.level ? "on" : ""}></i>)}<em>{x.levelWord}</em></span>}
<span style={{fontSize: "15px", fontWeight: "500", lineHeight: "1.3"}}>{x.value}</span>
</div>
</React.Fragment>))}
</div>
{v.edHasPeople && (<>
<div style={{display: "flex", alignItems: "center", gap: "10px"}}>
<div style={{display: "flex", paddingLeft: "6px"}}>
{v.edPeople.map((pp, $index) => (<React.Fragment key={$index}>
<span title={pp.name} style={{width: "34px", height: "34px", borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 0 0 2px var(--soft)", marginLeft: "-6px", marginRight: "0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "600"}}>{pp.initial}</span>
</React.Fragment>))}
</div>
<span style={{fontSize: "14px", color: "var(--muted)"}}>{v.edGoingText}</span>
</div>
</>)}
</div>

{v.edShowPrepHint && (<>
<span style={{fontSize: "14px", color: "var(--muted)", padding: "0 4px"}}>Tap "I'm in" and Mo will help you get ready.</span>
</>)}

{v.edShowPrep && (<>
<div style={{background: "#FFFFFF", borderRadius: "20px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}><span style={{fontSize: "17px", fontWeight: "600"}}>Get ready with Mo</span><span style={{fontSize: "14px", color: "var(--muted)"}}>{v.edPrepCount}</span></div>
<button onClick={v.edPractice} style={{textAlign: "left", border: "none", display: "flex", gap: "12px", alignItems: "center", background: "var(--soft)", borderRadius: "20px", padding: "12px", color: "var(--ink)"}}>
<Mo mood="happy" size={44} />
<span style={{flex: "1", display: "flex", flexDirection: "column", gap: "2px"}}>
<span style={{fontSize: "14px", color: "var(--muted)"}}>Practice first</span>
<span style={{fontSize: "16px", fontWeight: "600"}}>{v.edPracticeTitle}</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>{v.edPracticeWhy}</span>
</span>
<span aria-hidden="true" style={{fontSize: "20px"}}>›</span>
</button>
{v.edPrep.map((it, $index) => (<React.Fragment key={$index}>
<button onClick={it.toggle} aria-pressed={it.on} style={{textAlign: "left", border: "none", background: "transparent", display: "flex", alignItems: "center", gap: "12px", padding: "6px 2px", color: "var(--ink)", opacity: it.op}}>
<span style={{flex: "0 0 auto", width: "26px", height: "26px", borderRadius: "9px", border: "2px solid var(--ink)", background: it.box, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", boxSizing: "border-box"}}>{it.mark}</span>
<span style={{fontSize: "15px", lineHeight: "1.35", textDecoration: it.strike}}>{it.label}</span>
</button>
</React.Fragment>))}
</div>
</>)}

{v.edReflOpen && (<>
<div style={{background: "#FFFFFF", borderRadius: "20px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>
<div style={{display: "flex", gap: "10px", alignItems: "center"}}><Mo mood="happy" size={44} /><span style={{fontSize: "17px", fontWeight: "600"}}>How did it go?</span></div>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.edFeel.map((f, $index) => (<React.Fragment key={$index}>
<button onClick={f.pick} style={{minHeight: "42px", borderRadius: "999px", border: "none", padding: "8px 14px", fontSize: "14px", boxShadow: "0 0 0 1px rgba(0,0,0,0.05)", background: f.bg, color: f.fg}}>{f.label}</button>
</React.Fragment>))}
</div>
<span style={{fontSize: "15px", fontWeight: "500"}}>Anything you're proud of?</span>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.edWins.map((w, $index) => (<React.Fragment key={$index}>
<button onClick={w.pick} style={{minHeight: "42px", borderRadius: "999px", border: "none", padding: "8px 14px", fontSize: "14px", boxShadow: "0 0 0 1px rgba(0,0,0,0.05)", background: w.bg, color: w.fg}}>{w.label}</button>
</React.Fragment>))}
</div>
<span style={{fontSize: "14px", color: "var(--muted)"}}>Only you see this.</span>
</div>
</>)}

{v.edReflDone && (<>
<div className="rise" style={{background: "#E4F1F0", borderRadius: "24px", padding: "14px", display: "flex", gap: "12px", alignItems: "flex-start"}}>
<Mo mood="happy" size={44} />
<span style={{flex: "1", display: "flex", flexDirection: "column", gap: "4px"}}>
<span style={{fontSize: "15px", lineHeight: "1.4", color: "var(--accent-dark)"}}>{v.edReflMo}</span>
<span style={{fontSize: "14px", lineHeight: "1.4", color: "var(--accent-dark)"}}>{v.edReflWins}</span>
<span style={{fontSize: "14px", fontWeight: "600", color: "var(--accent-dark)"}}>{v.stepOne}</span>
</span>
</div>
</>)}

{v.edPast && (<>
<div style={{background: "#FFFFFF", borderRadius: "20px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>
<span style={{fontSize: "17px", fontWeight: "600"}}>Stay in touch</span>
<span style={{fontSize: "14px", color: "var(--muted)", marginTop: "-6px"}}>People you met at this event</span>
{v.edConnect.map((c, $index) => (<React.Fragment key={$index}>
<div style={{display: "flex", alignItems: "center", gap: "12px"}}>
<span style={{flex: "0 0 auto", width: "40px", height: "40px", borderRadius: "50%", background: "var(--soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "600"}}>{c.initial}</span>
<span style={{flex: "1", fontSize: "16px", fontWeight: "500"}}>{c.name}</span>
{c.canDm && (<><button onClick={c.msg} style={{height: "40px", borderRadius: "14px", border: "none", background: "var(--ink)", color: "#FFFFFF", padding: "0 14px", fontSize: "14px", fontWeight: "500"}}>Message {c.name}</button></>)}
{c.noDm && (<>
{c.notSent && (<><button onClick={c.hi} style={{height: "40px", borderRadius: "14px", border: "none", background: "var(--soft)", color: "var(--ink)", padding: "0 14px", fontSize: "14px", fontWeight: "500"}}>Say hi</button></>)}
{c.sent && (<><span style={{fontSize: "14px", color: "var(--accent-dark)"}}>Request sent ✓</span></>)}
</>)}
</div>
</React.Fragment>))}
<span style={{fontSize: "14px", color: "var(--muted)"}}>"Say hi" sends a message request. They choose whether to accept.</span>
</div>
</>)}
</div>
{v.edUpcoming && <div className="sticky-cta rsvp-footer"><div className="rsvp-control">{v.edRsvp.map((o,i)=><button key={i} className={o.on?"on":""} onClick={o.pick}>{o.label}</button>)}</div></div>}
{v.edReflOpen && <div className="sticky-cta"><button onClick={v.edSaveRefl} style={{background:v.edSaveBg}}>Save reflection</button></div>}
</>)}

{v.isPause && (<>
<div className="pad-cta" style={{width: "100%", minHeight: "100%", boxSizing: "border-box", padding: "26px 20px 30px", display: "flex", flexDirection: "column", background: "var(--bg)"}}>
<button onClick={v.goCircle} aria-label="Back to chat" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<div style={{flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "18px"}}>
<div className="rise" style={{background: "#FFFFFF", borderRadius: "20px", padding: "26px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>
<div><Mo mood="calm" size={120} /></div>
<span style={{fontSize: "27px", fontWeight: "600", lineHeight: "1.2"}}>Let's take a breath together</span>
<span style={{fontSize: "17px", lineHeight: "1.45", color: "var(--muted)"}}>This might hurt Jordan's feelings. You can still send it. You decide.</span>
<div style={{width: "100%", background: "#FBEDEA", borderRadius: "20px", padding: "14px 16px", textAlign: "left", fontSize: "16px", lineHeight: "1.4"}}>"Zelda?? Seriously, that's the most overrated answer ever."</div>
<div className="why-box"><strong>Why Mo noticed</strong><span>"Seriously" and "overrated" can sound like you are making fun of something Jordan loves. Other people in the circle can see it too, so Jordan might feel embarrassed.</span></div>
<div style={{display: "flex", flexDirection: "column", gap: "10px", width: "100%", marginTop: "4px"}}>
<button onClick={v.sayKindly} style={{height: "52px", borderRadius: "999px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "17px", fontWeight: "500"}}>Say it gently</button>
<button onClick={v.goReset} style={{height: "52px", borderRadius: "999px", border: "none", background: "var(--soft)", color: "var(--ink)", fontSize: "17px", fontWeight: "500"}}>Breathe with Mo</button>
<button onClick={v.sendAnyway} style={{height: "44px", border: "none", background: "transparent", color: "var(--muted)", fontSize: "16px", fontWeight:"600"}}>Send anyway</button>
</div>
</div>
</div>
</div>
</>)}

{v.isReset && (<>
<div style={{width: "100%", minHeight: "100%", boxSizing: "border-box", padding: "36px 24px 30px", display: "flex", flexDirection: "column", alignItems: "stretch", gap: "16px", textAlign: "center", background: "var(--bg)"}}>
<span style={{fontSize: "15px", color: "var(--muted)", letterSpacing: "1px"}}>ONE-MINUTE BREATHER</span>
<h1 style={{margin: "0", fontSize: "24px", fontWeight: "700", color: "var(--ink)"}} aria-live="polite">{v.breatheLabel}</h1>
<div style={{width: "260px", height: "260px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", alignSelf: "center"}}>
<div className="breathe" style={{position: "absolute", width: "250px", height: "250px", borderRadius: "50%", background: "radial-gradient(circle, #FFFFFF 0%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0) 72%)"}}></div>
<div key={v.breatheKey} className={v.breatheClass} style={{position: "relative"}}><Mo mood="calm" size={130} /></div>
</div>
<p style={{margin: "0", fontSize: "17px", lineHeight: "1.5", color: "var(--muted)", maxWidth: "310px", alignSelf: "center"}}>In as the light grows. Out as it fades. Nothing needs fixing right now.</p>
<div style={{alignSelf: "center", display: "flex", alignItems: "center", gap: "10px", background: "#FFFFFF", borderRadius: "999px", padding: "8px 16px"}}>
<span style={{fontSize: "15px", color: "var(--muted)"}}>Breathe in 4</span>
<span style={{width: "4px", height: "4px", borderRadius: "50%", background: "#A9B5AD", display: "inline-block"}}></span>
<span style={{fontSize: "15px", color: "var(--muted)"}}>Out 6</span>
<span style={{width: "4px", height: "4px", borderRadius: "50%", background: "#A9B5AD", display: "inline-block"}}></span>
<span style={{fontSize: "15px", fontWeight: "600", color: "var(--ink)"}}>{v.breatheLeft} left</span>
</div>
{!v.breatheActive && (<><button onClick={v.startBreathe} style={{alignSelf: "center", height: "44px", padding: "0 24px", borderRadius: "999px", border: "none", background: "var(--soft)", color: "var(--ink)", fontSize: "15px", fontWeight: "500"}}>Start again</button></>)}
{v.trustSent && (<>
<span className="rise" style={{fontSize: "15px", color: "var(--accent-dark)"}}>Sent to {v.trusted}: "Can you call me when you're free?"</span>
</>)}
<div className="sticky-cta"><button onClick={v.readyAfterReset}>I'm ready</button></div>
<button className="cta-secondary" onClick={v.textTrusted}>Text someone I trust</button>
</div>
</>)}

{v.isPractice && (<>
<div className={"pad-cta" + (v.showTextBar ? " text-screen" : "")} style={{padding: "28px 20px 20px", display: "flex", flexDirection: "column", gap: "16px"}}>
<div className="sticky-header inner-header">
<button onClick={v.goHome} aria-label="Back to Home" style={{width:"44px",height:"44px",border:0,borderRadius:"16px",background:"#FFFFFF",display:"grid",placeItems:"center"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke:"var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 6-6 6 6 6"/></svg></button>
<h1 className="header-title">Practice</h1>
<span style={{background: "#FFFFFF", borderRadius: "999px", padding: "6px 10px", fontSize: "14px", textAlign: "center", whiteSpace: "nowrap", justifySelf: "end"}}>{v.levelLabel.split(' · ')[0]}</span>
</div>
{!v.pBoundary && (<>
<div style={{position: "sticky", top: "68px", zIndex: "11", background: "var(--bg)", paddingBottom: "6px"}}>
<div style={{display: "flex", alignItems: "flex-start", gap: "0", padding: "0 4px", marginBottom: "4px"}}>
{v.pJourney.map((st, $index) => (<React.Fragment key={$index}>
{$index > 0 && <div style={{height: "2px", flex: "1", background: "var(--soft)", marginTop: "17px"}}></div>}
<div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "36px", flex: "0 0 36px"}}>
<div style={{width: "36px", height: "36px", borderRadius: "50%", background: st.bg, border: st.border, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center"}}>
{st.done && <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Done"><path d="M5 10 l3 3 l5-5"></path></svg>}
{st.active && <span style={{width: "8px", height: "8px", borderRadius: "50%", background: "#FFFFFF", display: "block"}}></span>}
</div>
<span className="pj-label">{st.label}</span>
</div>
</React.Fragment>))}
</div>
<div className="pj-sub">{v.pLevelText}</div>
</div>
</>)}
{v.pBoundary && (<>
<div className="rise" style={{background: "#FFFFFF", borderRadius: "20px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "12px", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>
<Mo mood="worried" size={56} />
<span style={{fontSize: "17px", lineHeight: "1.45"}}>That message from someone in your circle felt off. Let's figure out what happened — and what, if anything, to do next. No pressure.</span>
</div>
<button onClick={v.startBoundary} style={{height: "52px", borderRadius: "999px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "500"}}>Practice what to say</button>
<button onClick={v.boundaryHelp} style={{height: "52px", borderRadius: "999px", border: "none", background: "var(--soft)", color: "var(--ink)", fontSize: "16px", fontWeight: "500"}}>Talk to someone I trust</button>
<button onClick={v.goHome} style={{height: "44px", border: "none", background: "transparent", color: "var(--muted)", fontSize: "15px"}}>Not now</button>
</>)}
{v.pPicking && (<>
<div style={{display: "flex", flexDirection: "column", gap: "14px"}}>
<div style={{background: "#FFFFFF", borderRadius: "20px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>
<Mo mood="happy" size={56} />
<span style={{fontSize: "17px", lineHeight: "1.4"}}>Pick something to practice. It's just between us.</span>
</div>
<span style={{fontSize: "16px", fontWeight: "600"}}>Made for you today</span>
{v.recScenarios.map((sc, $index) => (<React.Fragment key={$index}>
<button onClick={sc.pick} style={{textAlign: "left", minHeight: "64px", borderRadius: "20px", border: "none", background: sc.bg, color: sc.fg, padding: "10px 12px", display: "grid", gridTemplateColumns:"38px 1fr auto", alignItems:"center", gap: "10px"}}>
<span style={{width:"38px",height:"38px",borderRadius:"12px",background:sc.fg==="#FFFFFF"?"rgba(255,255,255,.15)":"var(--soft)",display:"grid",placeItems:"center"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: sc.fg}} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={sc.icon}/></svg></span>
<span style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:"4px"}}><span style={{fontSize: "16px", fontWeight: "600"}}>{sc.title}</span><span style={{fontSize: "14px"}}>{sc.group}</span>{sc.picked && <span style={{background: "var(--tint)", color: "var(--accent-dark)", borderRadius: "999px", padding: "3px 10px", fontSize: "11px", fontWeight: "600"}}>Picked for you</span>}</span><span className="meta-pill">2 min</span>
</button>
</React.Fragment>))}
<span style={{fontSize: "16px", fontWeight: "600"}}>More to practice</span>
{v.moreScenarios.map((sc, $index) => (<React.Fragment key={$index}>
<button onClick={sc.pick} style={{textAlign: "left", minHeight: "64px", borderRadius: "20px", border: "none", background: sc.bg, color: sc.fg, padding: "10px 12px", display: "grid", gridTemplateColumns:"38px 1fr auto", alignItems:"center", gap: "10px"}}>
<span style={{width:"38px",height:"38px",borderRadius:"12px",background:sc.fg==="#FFFFFF"?"rgba(255,255,255,.15)":"var(--soft)",display:"grid",placeItems:"center"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: sc.fg}} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={sc.icon}/></svg></span>
<span style={{display:"flex",flexDirection:"column"}}><span style={{fontSize: "16px", fontWeight: "600"}}>{sc.title}</span><span style={{fontSize: "14px"}}>{sc.group}</span></span><span className="meta-pill">2 min</span>
</button>
</React.Fragment>))}
<span style={{fontSize: "16px", fontWeight: "500"}}>Pick a level</span>
<div style={{display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px"}}>
{v.levels.map((lv, $index) => (<React.Fragment key={$index}>
<button onClick={lv.pick} style={{minHeight: "64px", borderRadius: "18px", border: "none", background: lv.bg, color: lv.fg, padding: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px"}}>
<span style={{fontSize: "16px", fontWeight: "600"}}>{lv.name}</span>
<span style={{fontSize: "14px"}}>{lv.desc}</span>
</button>
</React.Fragment>))}
</div>
<span style={{fontSize: "14px", lineHeight: "1.4", color: "var(--muted)", padding: "0 4px"}}>{v.levelExplain}</span>
</div>
</>)}
{v.pStarted && (<>
<div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
<div style={{background: "#FFFFFF", borderRadius: "20px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 12px rgba(30,27,46,0.06)"}}>
<Mo mood="happy" size={56} />
<div style={{display: "flex", flexDirection: "column"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>{v.pTitle}</span>
<span style={{fontSize: "15px", color: "var(--muted)"}}>{v.pScene} Mo plays {v.pPartner}.</span>
</div>
</div>
<div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
<div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.pPartner} (practice)</span>
<div style={{alignSelf: "flex-start", background: "#FFFFFF", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "80%", fontSize: "17px", lineHeight: "1.45"}}>{v.pOpener}</div>
</div>
{v.pChosen && (<>
<div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
<div className="rise" style={{alignSelf: "flex-end", background: "var(--ink)", color: "#FFFFFF", borderRadius: "24px 24px 8px 24px", padding: "13px 17px", maxWidth: "80%", fontSize: "17px", lineHeight: "1.45"}}>{v.pText}</div>
<div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.pPartner} (practice)</span>
<div className="rise" style={{alignSelf: "flex-start", background: "#FFFFFF", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "80%", fontSize: "17px", lineHeight: "1.45"}}>{v.pReply}</div>
</div>
</div>
</>)}
</div>
{v.pShowChoices && (<>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
{v.showHint && (<>
<div className="rise" style={{background: "var(--soft)", borderRadius: "20px", padding: "12px 16px", fontSize: "16px", lineHeight: "1.4"}}>Hint from Mo: {v.pHint}</div>
</>)}
{v.pHintAsk && (<>
<button onClick={v.askHint} style={{alignSelf: "flex-start", minHeight: "40px", borderRadius: "999px", border: "1.5px dashed #B7C2BA", background: "transparent", color: "var(--ink)", padding: "6px 14px", fontSize: "14px", fontWeight: "500"}}>Need a hint? (1 left)</button>
</>)}
<span style={{fontSize: "14px", color: "var(--muted)", padding: "0 4px"}}>Pick a reply</span>
{v.pChoiceGoodFirst && (<><button onClick={v.fillGood} style={{textAlign: "left", minHeight: "56px", borderRadius: "20px", border: "none", background: "#FFFFFF", padding: "12px 16px", fontSize: "16px", lineHeight: "1.4", color: "var(--ink)"}}>"{v.pGoodText}"</button>
<button onClick={v.fillVague} style={{textAlign: "left", minHeight: "56px", borderRadius: "20px", border: "none", background: "#FFFFFF", padding: "12px 16px", fontSize: "16px", lineHeight: "1.4", color: "var(--ink)"}}>"{v.pVagueText}"</button></>)}
{v.pChoiceVagueFirst && (<><button onClick={v.fillVague} style={{textAlign: "left", minHeight: "56px", borderRadius: "20px", border: "none", background: "#FFFFFF", padding: "12px 16px", fontSize: "16px", lineHeight: "1.4", color: "var(--ink)"}}>"{v.pVagueText}"</button>
<button onClick={v.fillGood} style={{textAlign: "left", minHeight: "56px", borderRadius: "20px", border: "none", background: "#FFFFFF", padding: "12px 16px", fontSize: "16px", lineHeight: "1.4", color: "var(--ink)"}}>"{v.pGoodText}"</button></>)}
</div>
</>)}
{v.pShowType && (<>
<div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", padding: "0 4px"}}>{v.pTypeLabel}</span>
{v.typedHasTone && (<>
<span style={{alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px", background: v.typedToneBg, borderRadius: "999px", padding: "6px 14px", fontSize: "14px"}}><span style={{width: "8px", height: "8px", borderRadius: "50%", background: v.typedDot, display: "inline-block"}}></span>Mo: {v.typedTone}</span>
</>)}
</div>
</>)}
</div>
</>)}
{v.pPicking && <div className="sticky-cta start-cta"><button onClick={v.startPractice}>Start practice</button></div>}
{v.pChosen && <div className="sticky-cta"><button onClick={v.goFeedback}>See how I did</button></div>}
</div>
</>)}

{v.isFeedback && (<>
<div className="pad-cta" style={{display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", gap: "0"}}>
<div style={{marginBottom: "16px"}}><Mo mood="happy" size={72} /></div>
<h1 style={{margin: "0 0 32px", fontSize: "28px", fontWeight: "700", color: "var(--ink)", textAlign: "center"}}>{v.fbTitle}</h1>
<div style={{display: "flex", flexDirection: "column", gap: "12px", width: "100%"}}>
<div style={{background: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", textAlign: "left"}}>
<span style={{display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "6px"}}>What went well</span>
<span style={{display: "block", fontSize: "15px", color: "var(--ink)", lineHeight: "1.5"}}>{v.fbStar}</span>
</div>
<div style={{background: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", textAlign: "left"}}>
<span style={{display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "6px"}}>One thing to try</span>
<span style={{display: "block", fontSize: "15px", color: "var(--ink)", lineHeight: "1.5"}}>{v.fbSpark}</span>
</div>
{v.fbIsOwn && (<>
<div style={{background: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", textAlign: "left"}}>
<span style={{display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "6px"}}>Another way to say it</span>
<span style={{display: "block", fontSize: "15px", color: "var(--ink)", lineHeight: "1.5"}}>"{v.fbExample}"</span>
</div>
</>)}
</div>
</div>
<div className="sticky-cta"><button onClick={v.goGaming}>Try it for real</button></div>
<button className="cta-secondary" onClick={v.goPractice}>Practice again</button>
</>)}

{v.isWin && (<>
<div style={{width: "100%", minHeight: "100%", boxSizing: "border-box", padding: "50px 20px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", textAlign: "center", background: "var(--bg)"}}>
<span style={{fontSize: "15px", color: "var(--muted)", letterSpacing: "1px", textTransform: "uppercase"}}>{v.stepWord} earned</span>
<div className="rise" style={{width: "190px", height: "190px", borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 24px 60px rgba(30,27,46,0.22)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px"}}>
<Mo mood="happy" size={110} />
<span style={{fontSize: "18px", fontWeight: "600"}}>{v.winBadge}</span>
</div>
<h1 style={{margin: "8px 0 0", fontSize: "30px", fontWeight: "600", lineHeight: "1.15"}}>{v.winTitle}</h1>
<p style={{margin: "0", fontSize: "17px", lineHeight: "1.5", color: "var(--muted)"}}>{v.winText}</p>
<div style={{display: "flex", gap: "8px", alignItems: "center", marginTop: "4px"}}>
<span style={{width: "14px", height: "14px", borderRadius: "50%", background: "var(--ink)", display: "inline-block"}}></span>
<span style={{width: "14px", height: "14px", borderRadius: "50%", background: "var(--ink)", display: "inline-block"}}></span>
<span style={{width: "14px", height: "14px", borderRadius: "50%", background: "var(--ink)", display: "inline-block"}}></span>
<span style={{width: "14px", height: "14px", borderRadius: "50%", background: "var(--ink)", display: "inline-block"}}></span>
<span className="rise" style={{width: "14px", height: "14px", borderRadius: "50%", background: "var(--ink)", display: "inline-block"}}></span>
<span style={{fontSize: "15px", marginLeft: "6px"}}>5 this week</span>
</div>
<button onClick={v.finishWin} style={{width: "100%", height: "52px", borderRadius: "999px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "17px", fontWeight: "500", marginTop: "auto"}}>Add to my collection</button>
</div>
</>)}

{v.isMe && (<>
<div className="tab-screen">
<div className="tab-sticky-header me-identity-header">
<div style={{position: "relative", flex: "0 0 auto"}}>
{v.hasPhoto ? <img src={v.pPhoto} alt="Your profile photo" className="me-avatar" /> : <span className="me-avatar me-initials">{v.initials}</span>}
<label aria-label="Change profile photo" className="camera-button"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg><input type="file" accept="image/*" onChange={v.pickPhoto} style={{display:"none"}} /></label>
</div>
<div className="me-identity-copy"><h1>{v.fullName}</h1><span className="step-pill">✦ {v.steps} {v.stepsWord} this week</span></div>
</div>
<div className="tab-screen-content me-content">
<button onClick={v.openJourney} className="calm-card journey-preview" aria-label="Open My journey">
<div className="journey-mini-bars">{v.journey.map((w,$i)=><span key={$i}><i style={{height:w.h,background:w.bg}}></i></span>)}</div>
<div className="journey-preview-copy"><strong>My journey</strong><span>4 weeks of small steps</span></div><span className="row-chevron">›</span>
</button>
<section><h2 className="section-title">Badges</h2><div className="badge-scroll"><div className="badge-tile"><span className="badge-circle" style={{background:"#FFF0EA"}}><BadgeIcon kind="hello" color="#D4733A"/></span><span className="badge-name" style={{color:"var(--ink)",fontWeight:500}}>First Hello</span></div><div className="badge-tile"><span className="badge-circle" style={{background:"#FDE8EF"}}><BadgeIcon kind="kind" color="#A03060"/></span><span className="badge-name" style={{color:"var(--ink)",fontWeight:500}}>Kind Words</span></div><div className="badge-tile"><span className="badge-circle" style={{background:"#EEE8FD"}}><BadgeIcon kind="pause" color="#5A4FB0"/></span><span className="badge-name" style={{color:"var(--ink)",fontWeight:500}}>Breather</span></div><div className="badge-tile"><span className="badge-circle" style={{background:"var(--tint)"}}><BadgeIcon kind="circle" color="#3A7A5C"/></span><span className="badge-name" style={{color:"var(--ink)",fontWeight:500}}>First Circle</span></div><div className="badge-tile"><span className="badge-circle" style={{background:"#F0EDE8",opacity:0.5,border:"1.5px dashed #C8C4D0",boxSizing:"border-box"}}><BadgeIcon kind="event" color="var(--muted)"/></span><span className="badge-name">Game Night</span></div></div></section>
<section><h2 className="section-title">My people</h2><div className="me-list-card">
{v.meContacts.map((c,$i)=><button className="me-list-row" onClick={c.open} key={$i}><PersonAvatar name={c.name} size={40} tint="var(--soft)"/><span><strong>{c.name}</strong><small>{c.rel} · Gets help texts</small></span><b>›</b></button>)}
</div></section>
<section><h2 className="section-title">Settings</h2><div className="me-list-card">
{v.meSettings.map((item,$i)=><button className="me-list-row settings-row" onClick={item.open} key={$i}><span className="setting-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke:"var(--ink)"}} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={item.path}/></svg></span><span><strong>{item.label}</strong></span>{item.swatch && <i className="setting-swatch" style={{background:item.swatch}}></i>}<small>{item.value}</small><b>›</b></button>)}
</div></section>
<div className="me-footer-card">Mo isn't a therapist. Need help now? <strong>Call 988.</strong></div>
</div></div>
</>)}

{v.isMeJourney && <><MeSubHeader title="My journey" onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card"><div className="journey-bars">{v.journey.map((w,$i)=><div className="journey-col" key={$i}><strong>{w.value}</strong><i style={{height:w.h,background:w.bg}}></i><small>{w.label}</small></div>)}</div><span className="muted-copy">{v.stepsPerWeek}</span><div className="journey-stats"><div><strong>6</strong><small>practices</small></div><div><strong>2</strong><small>events joined</small></div><div><strong>Level 2</strong><small>reached</small></div></div><h2 className="section-title">Badges</h2><div className="badge-grid"><div><BadgeMark kind="hello" size={52}/><strong>First Hello</strong><small>Said hi</small></div><div><BadgeMark kind="kind" size={52}/><strong>Kind Words</strong><small>Disagreed gently</small></div><div><BadgeMark kind="pause" size={52}/><strong>Breather</strong><small>Took a pause</small></div><div><BadgeMark kind="event" size={52}/><strong>Game Night</strong><small>Go to one event</small></div></div><span className="muted-copy no-streaks">No streaks here. Skip a day or a week and nothing resets. Your steps and badges stay yours.</span></div></div></>}

{v.isMeTrusted && <><MeSubHeader title={v.ctName} onBack={v.meBack}/><div className="me-sub-content"><div className="home-card" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"14px",textAlign:"center"}}><span style={{width:"64px",height:"64px",borderRadius:"50%",background:"var(--soft)",display:"grid",placeItems:"center",fontSize:"24px",color:"var(--ink)"}}>{v.ctInitial}</span><h2 style={{margin:"0",fontSize:"22px",fontWeight:"700",color:"var(--ink)"}}>{v.ctName}</h2><span className="muted-copy">{v.ctRole} · {v.ctPhone}</span><span style={{fontSize:"15px",fontWeight:"600",color:"var(--ink)",alignSelf:"flex-start",textAlign:"left"}}>What they receive when you tap I need help</span><div style={{background:"var(--soft)",borderRadius:"14px",padding:"12px 16px",fontStyle:"italic",fontSize:"15px",color:"var(--ink)",textAlign:"left",alignSelf:"stretch"}}>Can you call me when you're free? I'm having a hard time.</div><button onClick={v.editContact} style={{background:"transparent",border:"1.5px solid var(--border)",borderRadius:"999px",padding:"8px 20px",fontSize:"15px",fontWeight:"500",color:"var(--ink)"}}>Edit</button>{v.ctOnlyOne && <button onClick={v.addFromMe} style={{border:"none",background:"transparent",color:"var(--accent)",fontSize:"15px",fontWeight:"500"}}>+ Add another person</button>}</div></div></>}


{v.isMeProfile && <><MeSubHeader title="Profile" onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card"><div className="sub-card-title"><h2>My profile</h2>{v.profView && <button onClick={v.editProfile}>Edit</button>}</div><div className="profile-photo-row">{v.hasPhoto ? <img src={v.pPhoto} alt="Your profile photo"/> : <span>{v.initials}</span>}<label>Change photo<input type="file" accept="image/*" onChange={v.pickPhoto}/></label></div>{v.profView ? <div className="profile-values"><div><span>First name</span><strong>{v.pFirst}</strong></div><div><span>Last name</span><strong>{v.pLast}</strong></div><div><span>Gender</span><strong>{v.pGender}</strong></div><div><span>Email</span><strong>{v.pEmail}</strong></div></div> : <div className="profile-form"><label>First name<input type="text" value={v.pFirst} onChange={v.setFirst}/></label><label>Last name<input type="text" value={v.pLast} onChange={v.setLast}/></label><span>Gender</span><div className="pill-group">{v.genderOpts.map((o,$i)=><button key={$i} onClick={o.pick} aria-pressed={o.on} className={o.on?'choice-pill on':'choice-pill'}>{o.label}</button>)}</div><label>Email<input type="email" value={v.pEmail} onChange={v.setEmail}/></label>{v.hasPhoto && <button className="quiet-action" onClick={v.removePhoto}>Remove profile photo</button>}<button className="primary-action" onClick={v.saveProfile}>Save profile</button></div>}<p className="muted-copy">In circles, people only see your first name and photo.</p></div></div></>}

{v.isMeColors && <><MeSubHeader title="Colors" onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card"><div className="theme-grid">{v.themeOpts.map((t,$i)=><button key={$i} onClick={t.pick} aria-pressed={t.on} aria-label={'Theme: '+t.name}><i style={{background:t.dot}}></i><span>{t.name}</span>{t.on&&<b>✓</b>}</button>)}</div></div><div style={{background:"#FFFFFF",borderRadius:"20px",padding:"16px",marginTop:"12px",boxShadow:"0 2px 12px rgba(30,27,46,0.07)"}}><span className="preview-label">Preview</span><div style={{display:"flex",alignItems:"center",gap:"14px"}}><span style={{width:"64px",height:"28px",borderRadius:"8px",background:v.prevAccent,transition:"background 0.2s ease"}}></span><span style={{width:"24px",height:"24px",borderRadius:"50%",background:v.prevDot,transition:"background 0.2s ease"}}></span><span style={{fontSize:"16px",fontWeight:"600",color:v.prevInk}}>Aa</span></div></div></div></>}

{v.isMeComfort && <><MeSubHeader title="Comfort" onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card comfort-card"><div className="segmented-row"><span>Text size</span><Segments opts={v.sizeSeg} /></div><div className="segmented-row"><span style={v.calmOn ? {color: "var(--accent)", fontWeight: "600"} : null}>{v.calmOn ? "Calm mode · On" : "Calm mode"}</span><Segments opts={v.calmSeg} /></div><div className="segmented-row"><span>Mo's help</span><Segments opts={v.moHelpSeg} /></div>
{v.calmOn && (<>
<div className="calm-preview"><Mo mood="calm" size={20} /><span>Animations off · Quieter layout</span></div>
</>)}<div className="segmented-row"><span>Chatting</span><Segments opts={v.chatSeg} /></div><div className="segmented-row"><span>Words</span><Segments opts={v.wordsSeg} /></div><p className="muted-copy">Calm mode turns off moving animations. Plain words drop the cheerful extras, like “brave steps”. Changes save right away.</p></div></div></>}

{v.isMeInterests && <><MeSubHeader title="Interests" onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card"><div className="interest-grid">{v.interestOpts.map((o,$i)=><button key={$i} onClick={o.pick} aria-pressed={o.on} className="interest-tile" style={{boxShadow:o.ring}}><CircleGlyph kind={o.key} tint={o.tint} size={40}/><span>{o.name}</span>{o.on&&<b className="tick">✓</b>}</button>)}</div><p className="muted-copy">{v.interestCount}. Changes save right away.</p></div></div></>}

{v.isMePrivacy && <><MeSubHeader title="Privacy & safety" onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card privacy-card"><h2>Who sees what</h2><div><strong>{v.trusted}</strong><span>Gets your I need help texts</span></div><p className="muted-copy">Your chats, check-ins and pauses are never shared.</p><h2>Blocked people</h2><div><strong>{v.blockedSummary}</strong></div><h2>Safety rules</h2><span className="safety-row"><b>1</b>Never share your address, passwords or money.</span><span className="safety-row"><b>2</b>If someone asks for secrets or money, Mo warns you privately.</span><span className="safety-row"><b>3</b>You can leave, mute or block anyone, anytime.</span><span className="safety-row"><b>4</b>Need help now? Tap Mo, then I need help, or call 988.</span></div></div></>}

{v.hasUiToast && <div className="ui-toast" role="status" aria-live="polite">
{v.uiToast === '+1 brave step' && <Mo mood="happy" size={32} />}
<span>{v.uiToast}{v.hasUndo ? ' ·' : ''}</span>
{v.hasUndo ? <button className="toast-undo" onClick={v.undoToast}>Undo</button> : (!v.toastQuiet && <button className="toast-dismiss" onClick={v.clearToast}>Dismiss</button>)}
</div>}
</div>
</div>

{v.showTabs && (<>
{v.showMoMenu && (<>
<div onClick={v.closeMo} aria-hidden="true" style={{position: "fixed", top: "0", left: "0", right: "0", bottom: "0", background: "transparent", zIndex: "98"}}></div>
<div className="rise" role="menu" aria-label="Mo" style={{position: "fixed", ...v.moPopupPos, width: "228px", background: "#FFFFFF", borderRadius: "20px", boxShadow: "0 8px 32px rgba(30,27,46,0.14), 0 0 0 1px rgba(30,27,46,0.06)", padding: "8px 0", boxSizing: "border-box", display: "flex", flexDirection: "column", zIndex: "101"}}>
{v.moOptions.map((o, $index) => (<button key={$index} role="menuitem" className={o.urgent ? "mo-row2 urgent" : "mo-row2"} onClick={o.go}><span style={{width: "36px", height: "36px", borderRadius: "10px", background: o.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={o.iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={o.path}></path></svg></span><span style={{fontSize: "15px", fontWeight: "500", color: o.urgent ? "#D96B6B" : "var(--ink)"}}>{o.label}</span></button>))}
</div>
</>)}
{!v.hideNav && (<nav aria-label="Main" style={{position: "fixed", bottom: "20px", left: "50%", transform: "translateX(calc(-50% - 32px))", zIndex: "90", background: "var(--ink)", borderRadius: "999px", padding: "8px 12px", display: "flex", flexDirection: "row", gap: "4px", width: "auto", boxShadow: "0 8px 24px rgba(30,27,46,0.25)"}}>
<button onClick={v.goHome} aria-label="Home" style={{padding: "10px 20px", borderRadius: "999px", border: "none", background: v.homeBg, color: v.homeFg, display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8"></path><path d="M5.5 9.5V21h13V9.5"></path></svg>
{v.tabIsHome && (<><span>Home</span></>)}
</button>
<button onClick={v.goCircles} aria-label="Circles" style={{padding: "10px 20px", borderRadius: "999px", border: "none", background: v.circlesBg, color: v.circlesFg, display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="9" r="3"></circle><circle cx="16" cy="9" r="3"></circle><path d="M2.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 15.3c.8-.2 1.6-.3 2.5-.3 3 0 5 1.5 5.5 5"></path></svg>
{v.tabIsCircles && (<><span>Circles</span></>)}
</button>
<button onClick={v.goMe} aria-label="Me" style={{padding: "10px 20px", borderRadius: "999px", border: "none", background: v.meBg, color: v.meFg, display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4.5 21c.8-4 3.3-6 7.5-6s6.7 2 7.5 6"></path></svg>
{v.tabIsMe && (<><span>Me</span></>)}
</button>
</nav>)}
<div className="home-indicator" aria-hidden="true"></div>
{v.showTextBar && (<div id="text-input-bar" style={{position: "fixed", bottom: v.kbVisible ? "291px" : "0", left: "0", right: "0", zIndex: "150", background: "#FFFFFF", borderTop: "1px solid rgba(30,27,46,0.08)", padding: "10px 16px calc(10px + env(safe-area-inset-bottom)) 16px", display: "flex", alignItems: "center", gap: "10px", boxSizing: "border-box", transition: "bottom 0.25s cubic-bezier(0.32, 0.72, 0, 1)"}}>
<input id="text-input-field" type="text" inputMode="none" onFocus={v.kbFocus} onBlur={v.kbBlur} value={v.barValue} onChange={v.barOnChange} onKeyDown={v.barOnKey} placeholder={v.barPlaceholder} aria-label={v.barPlaceholder} autoComplete="off" autoCorrect="off" autoCapitalize="sentences" spellCheck={true} style={{flex: "1", minWidth: "0", height: "44px", background: "#F4F3F0", border: "none", borderRadius: "22px", padding: "0 16px", fontSize: "16px", color: "#1E1B2E", outline: "none", WebkitAppearance: "none", fontFamily: "inherit", boxSizing: "border-box"}} />
<button onClick={v.barSend} onMouseDown={function (e) { e.preventDefault(); v.kbTapMark(); }} onPointerDown={v.kbTapMark} aria-label="Send" style={{width: "44px", height: "44px", borderRadius: "50%", background: "#4A7C6F", border: "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", padding: "0"}}>
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="10" y1="16" x2="10" y2="4"/><polyline points="5,9 10,4 15,9"/></svg>
</button>
</div>)}
{v.showTextBar && <SimKeyboard open={v.kbVisible} num={v.kbNum} shift={v.kbShift} onKey={v.kbKey} onBack={v.kbBack} onSpace={v.kbSpace} onShift={v.kbShiftTap} onNum={v.kbNumToggle} onReturn={v.kbReturn} />}
{!v.showPracticeGate && !v.hideMoFab && (<button onPointerDown={v.moDown} onPointerMove={v.moMove} onPointerUp={v.moUp} onPointerCancel={v.moUp} onClick={v.moKey} aria-label="Open Mo" aria-expanded={v.moOpen} aria-haspopup="menu" className={v.stepBump ? "mo-fab mo-cheer" : "mo-fab"} style={{left: v.moX + "px", bottom: v.moY + "px", cursor: v.moDragging ? "grabbing" : "grab", transition: v.moDragging ? "none" : "left 0.25s ease-out, bottom 0.25s ease-out", touchAction: "none", userSelect: "none"}}>
<span className="mo-breathe" style={{display: "flex", pointerEvents: "none"}}><Mo mood={v.floatMood} size={44} /></span>
</button>)}

</>)}
{v.showPracticeGate && (<>
<div onClick={v.gateDismiss} style={{position: "fixed", top: "0", left: "0", right: "0", bottom: "0", background: "rgba(0,0,0,0.3)", zIndex: "199"}}></div>
<div className="rise" role="dialog" aria-label="Warm up first" style={{position: "fixed", bottom: "0", left: "0", right: "0", background: "#FFFFFF", borderRadius: "24px 24px 0 0", boxShadow: "0 -8px 32px rgba(30,27,46,0.12)", padding: "32px 24px 48px", zIndex: "200", textAlign: "center"}}>
<span style={{display: "block", width: "36px", height: "4px", borderRadius: "999px", background: "#E0DED8", margin: "0 auto 24px"}}></span>
<h2 style={{margin: "0", fontSize: "20px", fontWeight: "700", color: "var(--ink)"}}>Want to warm up first?</h2>
<p style={{margin: "8px 0 0", fontSize: "15px", color: "var(--muted)"}}>A quick 2-min practice makes real messages easier.</p>
<button onClick={v.gatePractice} style={{display: "block", width: "100%", height: "56px", marginTop: "24px", borderRadius: "999px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "600"}}>Practice first</button>
<button onClick={v.gateChat} style={{display: "block", width: "100%", height: "56px", marginTop: "12px", borderRadius: "999px", border: "none", background: "var(--hover)", color: "var(--ink)", fontSize: "16px", fontWeight: "500"}}>Go to chat</button>
</div>
</>)}
{v.showMeet && (<>
<div onClick={v.meetClose} style={{position: "fixed", top: "0", left: "0", right: "0", bottom: "0", background: "rgba(0,0,0,0.3)", zIndex: "199"}}></div>
<div className="rise" role="dialog" aria-label="Before you meet" style={{position: "fixed", bottom: "0", left: "0", right: "0", background: "#FFFFFF", borderRadius: "24px 24px 0 0", boxShadow: "0 -8px 32px rgba(30,27,46,0.12)", padding: "32px 24px 48px", zIndex: "200"}}>
<span style={{display: "block", width: "36px", height: "4px", borderRadius: "999px", background: "#E0DED8", margin: "0 auto 24px"}}></span>
<div style={{display: "flex", alignItems: "center", gap: "12px"}}>
<Mo mood="happy" size={40} />
<h2 style={{margin: "0", fontSize: "20px", fontWeight: "700", color: "var(--ink)"}}>Before you meet</h2>
</div>
<div style={{display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px"}}>
{v.meetList.map((m, $i) => (<button key={$i} onClick={m.tick} role="checkbox" aria-checked={m.on} style={{display: "flex", alignItems: "center", gap: "12px", width: "100%", minHeight: "48px", border: "none", background: "var(--soft)", borderRadius: "14px", padding: "10px 14px", textAlign: "left", fontSize: "16px", color: "var(--ink)"}}>
<svg width="22" height="22" viewBox="0 0 22 22" fill={m.on ? "var(--accent)" : "none"} stroke={m.on ? "var(--accent)" : "var(--muted)"} strokeWidth="1.5" aria-hidden="true" style={{flex: "0 0 auto"}}><circle cx="11" cy="11" r="10"></circle>{m.on && <path d="M6.5 11.5l3 3 6-6.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>}</svg>
<span>{m.label}</span>
</button>))}
</div>
<button onClick={v.meetClose} style={{display: "block", width: "100%", height: "56px", marginTop: "20px", borderRadius: "999px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "600"}}>I'm ready</button>
<button onClick={v.meetShare} style={{display: "block", width: "100%", height: "48px", marginTop: "8px", borderRadius: "999px", border: "none", background: "transparent", color: "var(--muted)", fontSize: "16px", fontWeight: "500"}}>{v.meetShareLabel}</button>
</div>
</>)}
{v.showSayHi && (<>
<div onClick={v.sayHiClose} style={{position: "fixed", top: "0", left: "0", right: "0", bottom: "0", background: "rgba(0,0,0,0.3)", zIndex: "199"}}></div>
<div className="rise" role="dialog" aria-label="Say hi" style={{position: "fixed", bottom: "0", left: "0", right: "0", background: "#FFFFFF", borderRadius: "24px 24px 0 0", boxShadow: "0 -8px 32px rgba(30,27,46,0.12)", padding: "32px 24px 48px", zIndex: "200"}}>
<span style={{display: "block", width: "36px", height: "4px", borderRadius: "999px", background: "#E0DED8", margin: "0 auto 24px"}}></span>
<div style={{display: "flex", alignItems: "center", gap: "12px"}}>
<Mo mood="happy" size={40} />
<span style={{fontSize: "16px", lineHeight: "1.4", color: "var(--ink)"}}>Here's an idea. Change it so it sounds like you.</span>
</div>
<textarea value={v.sayHiText} onChange={v.setSayHiText} aria-label="Your message" rows={3} style={{display: "block", width: "100%", boxSizing: "border-box", marginTop: "16px", border: "1.5px solid rgba(30,27,46,0.1)", borderRadius: "16px", padding: "12px 14px", fontSize: "16px", lineHeight: "1.45", color: "var(--ink)", fontFamily: "inherit", resize: "none", outline: "none"}}></textarea>
<a href={v.sayHiHref} onClick={v.sayHiOpenMsgs} style={{display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", width: "100%", height: "56px", marginTop: "20px", borderRadius: "999px", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "600", textDecoration: "none"}}>Open in Messages</a>
<button onClick={v.sayHiClose} style={{display: "block", width: "100%", height: "48px", marginTop: "8px", borderRadius: "999px", border: "none", background: "transparent", color: "var(--muted)", fontSize: "16px", fontWeight: "500"}}>Not now</button>
</div>
</>)}
{v.showCelebrate && <div className="step-celebrate" role="status" aria-live="polite"><Mo mood="happy" size={64} /><strong>{v.stepOne}</strong><span>{v.steps} this week</span></div>}
</div>
</MoGradientContext.Provider>);
  }
}

export default function App() {
  return (
    <div className="stage">
      <div className="phone"><Bridge /></div>
    </div>
  );
}
