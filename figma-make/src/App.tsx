// @ts-nocheck
import React from 'react';

class DCLogic extends React.Component {
  constructor(props) { super(props); this.state = {}; }
  render() { return this.renderView(this.renderVals()); }
}

class MoBase extends DCLogic {
  renderVals() {
    var mood = this.props.mood || 'happy';
    var size = parseInt(this.props.size, 10) || 160;
    var fills = { happy: 'url(#moHappy)', worried: 'url(#moWorried)', calm: 'url(#moCalm)' };
    var labels = { happy: 'Mo, smiling', worried: 'Mo, looking concerned', calm: 'Mo, calm with eyes closed' };
    return {
      px: size + 'px',
      fill: fills[mood] || fills.happy,
      label: labels[mood] || labels.happy,
      isHappy: mood === 'happy',
      isWorried: mood === 'worried',
      isCalm: mood === 'calm'
    };
  }
}

class Mo extends MoBase {
  renderView(v) {
    return (<>
<div style={{width: v.px, height: v.px, display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="100%" height="100%" viewBox="0 0 160 160" role="img" aria-label={v.label}>
<defs>
<radialGradient id="moHappy" cx="40%" cy="30%" r="80%"><stop offset="0" stopColor="#FFF4EE"></stop><stop offset="0.6" stopColor="#F7C9D4"></stop><stop offset="1" stopColor="#C9B6F0"></stop></radialGradient>
<radialGradient id="moWorried" cx="40%" cy="30%" r="80%"><stop offset="0" stopColor="#FFF4EC"></stop><stop offset="0.6" stopColor="#F9C7B4"></stop><stop offset="1" stopColor="#EE9F95"></stop></radialGradient>
<radialGradient id="moCalm" cx="40%" cy="30%" r="80%"><stop offset="0" stopColor="#F6F4FF"></stop><stop offset="0.6" stopColor="#D3CDF6"></stop><stop offset="1" stopColor="#A9B8EE"></stop></radialGradient>
</defs>
<ellipse cx="80" cy="150" rx="44" ry="6" fill="#3B3350" opacity="0.08"></ellipse>
<path d="M80 30 C124 30 144 62 144 98 C144 132 116 146 80 146 C44 146 16 132 16 98 C16 62 36 30 80 30 Z" fill={v.fill}></path>
<ellipse cx="60" cy="58" rx="16" ry="9" fill="#FFFFFF" opacity="0.55"></ellipse>
<circle cx="50" cy="106" r="7" fill="#F29BAE" opacity="0.55"></circle>
<circle cx="110" cy="106" r="7" fill="#F29BAE" opacity="0.55"></circle>
{v.isHappy && (<>
<g>
<ellipse cx="63" cy="92" rx="5.5" ry="7.5" fill="#3B3350"></ellipse>
<ellipse cx="97" cy="92" rx="5.5" ry="7.5" fill="#3B3350"></ellipse>
<circle cx="65" cy="89" r="2" fill="#FFFFFF"></circle>
<circle cx="99" cy="89" r="2" fill="#FFFFFF"></circle>
<path d="M72 110 Q80 117 88 110" fill="none" stroke="#3B3350" strokeWidth="3.2" strokeLinecap="round"></path>
</g>
</>)}
{v.isWorried && (<>
<g>
<path d="M54 80 L67 84" stroke="#3B3350" strokeWidth="3" strokeLinecap="round"></path>
<path d="M106 80 L93 84" stroke="#3B3350" strokeWidth="3" strokeLinecap="round"></path>
<ellipse cx="63" cy="94" rx="5.5" ry="7" fill="#3B3350"></ellipse>
<ellipse cx="97" cy="94" rx="5.5" ry="7" fill="#3B3350"></ellipse>
<path d="M73 114 Q80 109 87 114" fill="none" stroke="#3B3350" strokeWidth="3" strokeLinecap="round"></path>
</g>
</>)}
{v.isCalm && (<>
<g>
<path d="M56 92 Q63 86 70 92" fill="none" stroke="#3B3350" strokeWidth="3.5" strokeLinecap="round"></path>
<path d="M90 92 Q97 86 104 92" fill="none" stroke="#3B3350" strokeWidth="3.5" strokeLinecap="round"></path>
<path d="M74 111 Q80 115 86 111" fill="none" stroke="#3B3350" strokeWidth="3" strokeLinecap="round"></path>
</g>
</>)}
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
  tech: 'M4 5h16v12H4zM8 21h8M12 17v4M8 10l2 2-2 2M13 14h3'
};

function StatusBar() {
  return <div className="ios-status" aria-hidden="true"><span>9:41</span><span className="status-icons">
    <svg width="18" height="12" viewBox="0 0 18 12" fill="var(--ink)"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round"><path d="M1 4c4.5-4 10.5-4 15 0M4 7c2.8-2.4 6.2-2.4 9 0M7 10c1-.8 2-.8 3 0"/></svg>
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none" stroke="var(--ink)" strokeWidth="1.5"><rect x=".8" y=".8" width="20" height="10.4" rx="3"/><path d="M23 4v4"/><rect x="3" y="3" width="16" height="6" rx="1.5" fill="var(--ink)" stroke="none"/></svg>
  </span></div>;
}

function PersonAvatar({ name, tint, size = 40, onClick }) {
  var tag = onClick ? 'button' : 'span';
  return React.createElement(tag, {
    onClick: onClick,
    className: 'person-avatar',
    'aria-label': onClick ? 'Message ' + name : name,
    style: { width: size + 'px', height: size + 'px', background: tint || 'var(--soft)' }
  }, (name || '?')[0]);
}

function CircleGlyph({ kind, tint, size = 44 }) {
  return <span className="circle-glyph" style={{width: size + 'px', height: size + 'px', background: tint || 'var(--soft)'}}>
    <svg width={size > 40 ? 24 : 20} height={size > 40 ? 24 : 20} viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={circleIconPaths[kind] || circleIconPaths.gaming}/></svg>
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

function MeSubHeader({ title, onBack }) {
  return <div className="sticky-header inner-header"><button onClick={onBack} aria-label="Back to Me" className="inner-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke:"var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 6-6 6 6 6"/></svg></button><span className="header-title">{title}</span><span></span></div>;
}

class BridgeBase extends DCLogic {
  renderVals() {
    var s = this.state || {};
    var self = this;
    var changeWithUndo = function (patch, message, undoPatch) {
      var token = Date.now();
      self.setState(Object.assign({}, patch, { uiToast: message, undoPatch: undoPatch, undoToken: token }));
      setTimeout(function () {
        if (self.state.undoToken === token) self.setState({ uiToast: '', undoPatch: null, undoToken: 0 });
      }, 5000);
      return token;
    };
    var notify = function (message) {
      var token = Date.now();
      self.setState({ uiToast: message, undoPatch: null, undoToken: token });
      setTimeout(function () {
        if (self.state.undoToken === token) self.setState({ uiToast: '', undoToken: 0 });
      }, 5000);
    };
    var screen = s.screen || (s.onbDone ? 'checkin' : 'onboard');
    var trusted = (s.trusted || '').trim() || 'Mom';
    var trustedRel = s.trustedRel || 'Parent';
    var interests = s.interests || ['gaming', 'music'];
    var textLarge = !!s.textLarge;
    var calmMode = !!s.calmMode;
    var textFirst = s.textFirst === undefined ? true : s.textFirst;
    var draft = s.draft || '';
    var battery = (s.ciFeel === 'over') ? 'low' : (s.ciFeel === 'ready' ? 'full' : 'okay');
    var sent = s.sent || '';
    var plan = s.plan || 'music';
    var pChoice = s.pChoice || '';
    var momOn = s.momOn === undefined ? true : s.momOn;
    var mariaOn = s.mariaOn === undefined ? true : s.mariaOn;
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
      cooking: { name: 'Cooking', initial: 'C', tint: '#DDF1E6', here: 2, topic: 'What is the easiest thing you can cook?',
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
    var drafts = {
      ask: cd.ask,
      share: cd.share,
      angry: "Zelda?? Seriously, that's the most overrated answer ever.",
      kind: "Ha, Zelda's not really my thing, but I'm curious what you love about it?"
    };
    var go = function (sc, extra) {
      return function () { self.setState(Object.assign({ screen: sc, menuOpen: false, safetyNote: '', moOpen: false, evToast: '' }, extra || {})); };
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
    var pick = function (on) { return on ? 'var(--ink)' : 'rgba(255,255,255,0.75)'; };
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
    var reqState = s.reqState || 'pending';
    var seeSteps = s.seeSteps === undefined ? true : s.seeSteps;
    var seeHelp = !!s.seeHelp;
    var ciFeel = s.ciFeel || 'okay';
    var ciUp = s.ciUp || 'group';
    var ciHard = s.ciHard || 'start';
    var cFilter = s.cFilter || 'foryou';
    var readOnly = !!s.readOnly;
    var helpTo = s.helpTo || trusted;
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
    var hardMap = { start: ['joinin', 'invite'], keep: ['onread', 'joinin'], tone: ['repair', 'onread'], disagree: ['disagree', 'repair'], leave: ['leave', 'cancel'] };
    var upMap = { group: ['joinin', 'leave'], text: ['onread', 'invite'], hard: ['repair', 'disagree'], none: [] };
    var whyHard = { start: 'starting a chat', keep: 'keeping a chat going', tone: 'reading tone', disagree: 'disagreeing', leave: 'leaving or saying no' };
    var feelLabels = { over: 'Overwhelmed', okay: 'Okay', ready: 'Ready to connect' };
    var upLabels = { group: 'A group hangout', text: 'Texting someone new', hard: 'A hard conversation', none: 'Nothing planned' };
    var recCount = ciFeel === 'over' ? 1 : (ciFeel === 'ready' ? 3 : 2);
    var recLevel = ciFeel === 'ready' ? 2 : 1;
    var recKeys = [];
    hardMap[ciHard].concat(upMap[ciUp]).forEach(function (k) { if (recKeys.indexOf(k) < 0) recKeys.push(k); });
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
    if (pChoice === 'own') choiceGood = ownEv.good;
    var levelNames = ['Level 1 · Guided', 'Level 2 · Light help', 'Level 3 · On your own'];
    var scenItem = function (k) {
      var on = k === pScen;
      var iconMap = { joinin: 'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 21c.5-4 2.2-6 5-6M14 15c4 0 6.5 2 7 6', onread: 'M4 5h16v12H9l-5 4V5ZM8 10h8', cancel: 'M4 5h16v15H4zM8 3v4M16 3v4M7 13l10 0', leave: 'M10 4H5v16h5M15 8l4 4-4 4M19 12H9', repair: 'M4 5h16v12H9l-5 4V5Zm5 7 2 2 4-5', invite: 'M12 5v14M5 12h14', disagree: 'M5 7h14M5 12h10M5 17h7' };
      return { title: scripts[k].title, group: scripts[k].group, icon: iconMap[k], bg: on ? 'var(--ink)' : 'rgba(255,255,255,0.85)', fg: on ? '#FFFFFF' : 'var(--ink)',
        pick: function () { self.setState({ pScen: k }); } };
    };
    var recScenarios = recKeys.map(scenItem);
    var moreScenarios = Object.keys(scripts).filter(function (k) { return recKeys.indexOf(k) < 0; }).map(scenItem);
    var recList = recKeys.map(function (k) {
      var fromHard = hardMap[ciHard].indexOf(k) >= 0;
      return { title: scripts[k].title, level: 'Level ' + recLevel,
        why: fromHard ? 'Because ' + whyHard[ciHard] + ' feels hard lately' : 'For your ' + upLabels[ciUp].toLowerCase().replace('a ', '') + ' coming up',
        start: function () { self.setState({ screen: 'practice', pScen: k, pLevel: recLevel, pStarted: true, pChoice: '', moOpen: false }); } };
    });
    var upNextText = ciUp === 'group'
      ? "Warm up for tonight's Gaming chat"
      : (ciUp === 'none' ? 'Practice one small conversation step' : 'Warm up for ' + upLabels[ciUp].toLowerCase());
    var chip = function (opts, cur, key) {
      return Object.keys(opts).map(function (k) {
        var on = k === cur; var o = {};
        o[key] = k;
        return { label: opts[k], on: on, bg: on ? 'var(--ink)' : 'rgba(255,255,255,0.85)', fg: on ? '#FFFFFF' : 'var(--ink)',
          pick: function () { self.setState(o); } };
      });
    };
    var levelList = [['Level 1', 'Guided'], ['Level 2', 'Light help'], ['Level 3', 'On your own']].map(function (l, i) {
      var on = pLevel === i + 1;
      return { name: l[0], desc: l[1], bg: on ? 'var(--ink)' : 'rgba(255,255,255,0.85)', fg: on ? '#FFFFFF' : 'var(--ink)',
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
      var cardDates = { e0: ['YESTERDAY','8'], e1: ['FRI','7'], e2: ['SAT','8'], e3: ['SUN','9'], e4: ['THU','6'] };
      var cardDate = e.dateDay ? [e.dateDay, e.dateNum] : (cardDates[e.id] || ['SUN','9']);
      return { title: e.title, when: e.when, where: e.where, tag: e.tag, meta: (e.duration || '1 hr') + ' · ' + Math.max(1, e.going || 0) + ' people',
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
    var evDate = s.evDate || 'SUN 9';
    var evTime = s.evTime || '11:00 AM';
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
        return { label: val, on: on, bg: on ? 'var(--ink)' : 'rgba(255,255,255,0.85)', fg: on ? '#FFFFFF' : 'var(--ink)',
          pick: function () { self.setState(o); } };
      });
    };
    var hostOpts = ['outside'].concat(Object.keys(circleData)).map(function (k) {
      var on = k === evHost;
      return { label: k === 'outside' ? 'Outside circles' : circleData[k].name, on: on,
        bg: on ? 'var(--ink)' : 'rgba(255,255,255,0.85)', fg: on ? '#FFFFFF' : 'var(--ink)',
        pick: function () { self.setState({ evHost: k }); } };
    });
    var inviteOpts = ['Jordan', 'Maya', 'Priya', 'Kai'].map(function (n) {
      var on = evInvite.indexOf(n) >= 0;
      return { label: n, on: on, bg: on ? 'var(--ink)' : 'rgba(255,255,255,0.85)', fg: on ? '#FFFFFF' : 'var(--ink)',
        pick: function () { self.setState({ evInvite: on ? evInvite.filter(function (x) { return x !== n; }) : evInvite.concat([n]) }); } };
    });
    var startEvent = function (from, host) {
      return function () { self.setState({ screen: 'newEvent', evFrom: from, evHost: host, evStep: 1, evWhat: '', evDate: 'SUN 9', evTime: '11:00 AM', evDuration: '1 hr', evMode: 'In person', evVenue: venues[0].name, evOnline: 'Voice chat', evGroupSize: 4, evRemind: '1 hour before', evSize: '', evSound: 'Quiet', evLight: 'Soft', evInvite: ['Jordan'], evShare: true, moOpen: false, menuOpen: false, evToast: '' }); };
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
      shareBg: evShare ? 'var(--ink)' : 'rgba(255,255,255,0.85)', shareFg: evShare ? '#FFFFFF' : 'var(--ink)',
      toggleShare: function () { self.setState({ evShare: !evShare }); },
      evTip: evInPerson ? 'Meeting in person? Pick a public place and keep it short the first time. You can leave anytime.'
        : (evWhere.indexOf('text') >= 0 ? 'Text only is a low-pressure start. People can join without talking out loud.' : 'Voice is optional. People can just listen and type if they want.'),
      evPreview: evWhat + ' · ' + evWhen,
      evPreviewSense: evSound + ' · ' + evLight,
      evPreviewWhere: evWhere + (evIsOutside ? ' · with ' + (evInvite.length ? evInvite.join(', ') : 'nobody yet') : ' · ' + evSize),
      canCreate: !evIsOutside || evInvite.length > 0,
      createBg: (!evIsOutside || evInvite.length > 0) ? 'var(--ink)' : '#B9B1C8',
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
      pickPhoto: function (e) { var f = e.target.files && e.target.files[0]; if (f) changeWithUndo({ pPhoto: URL.createObjectURL(f) }, 'Saved ✓', { pPhoto: s.pPhoto || '' }); },
      removePhoto: function () { changeWithUndo({ pPhoto: '' }, 'Photo removed', { pPhoto: s.pPhoto || '' }); },
      genderOpts: genderList.map(function (g) {
        var on = g === pGender;
        return { label: g, on: on, bg: on ? 'var(--ink)' : 'rgba(255,255,255,0.85)', fg: on ? '#FFFFFF' : 'var(--ink)',
          pick: function () { self.setState({ pGender: g }); } };
      })
    };

    // ---------- DMs ----------
    var cTab = s.cTab || 'circles';
    var dmData = {
      jordan: { name: 'Jordan', from: 'Gaming circle', tint: '#F9DCE4',
        msgs: [['them', 'Hey! Still up for co-op on Friday?'], ['me', 'Yes! What time?'], ['them', '7 works? I can show you the Water Temple trick.']],
        ideas: ['7 works! See you then.', 'Can we do 8? I have dinner at 7.'], replies: ["Perfect, I'll send the invite!", '8 is fine! See you then.'], reply: 'Ha, fair! Tell me what you think.', unread: true },
      maya: { name: 'Maya', from: 'Gaming circle', tint: '#E3E0F8',
        msgs: [['them', 'Your island idea was so cute. Do you have a Switch?']],
        ideas: ['Yes! Want to visit my island?', 'Not yet, but I love watching people play.'], replies: ['Yay! Send me your Dream Address when you can.', 'Same! Want to watch a stream together sometime?'], reply: 'Oh cool, tell me more!', unread: true },
      priya: { name: 'Priya', from: 'Music circle', tint: '#DDF1E6',
        msgs: [['me', 'Thanks for the playlist!'], ['them', 'Anytime! Which song did you like most?']],
        ideas: ['The second one was so calming.', 'Honestly, all of them!'], replies: ['Same! I listen to it while studying.', 'Haha, good taste. I will make you another one!'], reply: 'Haha, fair enough!', unread: false }
    };
    var dmMsgs = s.dmMsgs || {};
    var dmRead = s.dmRead || {};
    var dmReqState = s.dmReq || 'pending';
    var msgsFor = function (k) { return dmMsgs[k] || dmData[k].msgs; };
    var dmKey = s.dm || 'jordan';
    var dmd = dmData[dmKey];
    var dmDraft = s.dmDraft || '';
    var harshWords = ['whatever', 'stupid', 'shut up', 'annoying', 'hate', 'overrated', 'dumb'];
    var dmHarsh = harshWords.some(function (w) { return dmDraft.toLowerCase().indexOf(w) >= 0; });
    var harshWhy = { whatever: 'can sound like you do not care what they said', stupid: 'calls their idea bad, which can hurt', 'shut up': 'tells them to stop talking, which feels rude', annoying: 'can feel like you are criticizing them as a person', hate: 'is a very strong word, so it can feel like an attack', overrated: 'can sound like you are dismissing something they love', dumb: 'calls their idea bad, which can hurt' };
    var harshHit = harshWords.filter(function (w) { return dmDraft.toLowerCase().indexOf(w) >= 0; })[0] || '';
    var dmWhy = harshHit ? 'Why: "' + harshHit + '" ' + harshWhy[harshHit] + '.' : '';
    var openDm = function (k) {
      return function () { var r = Object.assign({}, dmRead); r[k] = true; self.setState({ screen: 'dm', dm: k, dmDraft: '', dmRead: r, moOpen: false, dmGentle: false }); };
    };
    var unreadCount = Object.keys(dmData).filter(function (k) { return dmData[k].unread && !dmRead[k]; }).length;
    var sendDm = function () {
      if (!dmDraft.trim()) return;
      var idx = dmd.ideas.indexOf(dmDraft); var replyText = idx >= 0 ? dmd.replies[idx] : dmd.reply;
      var list = msgsFor(dmKey).concat([['me', dmDraft]]);
      var m = Object.assign({}, dmMsgs); m[dmKey] = list;
      var sendToken = Date.now();
      changeWithUndo({ dmMsgs: m, dmDraft: '', dmGentle: false, dmSendToken: sendToken }, 'Sent to ' + dmd.name, { dmMsgs: dmMsgs, dmDraft: dmDraft, dmGentle: !!s.dmGentle, dmSendToken: 0 });
      setTimeout(function () {
        if (self.state.dmSendToken !== sendToken) return;
        var m2 = Object.assign({}, self.state.dmMsgs || {}); m2[dmKey] = (m2[dmKey] || list).concat([['them', replyText]]);
        self.setState({ dmMsgs: m2 });
      }, 900);
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
        return { name: d.name, initial: d.name[0], tint: d.tint, from: d.from,
          preview: (last[0] === 'me' ? 'You: ' : '') + last[1], unread: unread,
          weight: unread ? '600' : '400', open: openDm(k) };
      }),
      reqPendingDm: dmReqState === 'pending', reqDone: dmReqState !== 'pending',
      reqDoneText: dmReqState === 'reported' ? 'Reported and blocked. Alex can’t message you.' : 'Request deleted. Alex isn’t told.',
      reqReport: function () { changeWithUndo({ dmReq: 'reported' }, 'Blocked Alex', { dmReq: dmReqState }); },
      reqDelete: function () { changeWithUndo({ dmReq: 'deleted' }, 'Request deleted', { dmReq: dmReqState }); },
      isDm: screen === 'dm',
      dmName: dmd.name, dmFrom: 'Met in the ' + dmd.from, dmTint: dmd.tint, dmInitial: dmd.name[0],
      dmMessages: msgsFor(dmKey).map(function (m, index, list) {
        var me = m[0] === 'me';
        return { text: m[1], align: me ? 'flex-end' : 'flex-start', bg: me ? 'var(--ink)' : 'rgba(255,255,255,0.85)', fg: me ? '#FFFFFF' : 'var(--ink)',
          radius: me ? '24px 24px 8px 24px' : '24px 24px 24px 8px', me: me, showAvatar: !me && (index === 0 || list[index - 1][0] !== 'them'), lastInGroup: index === list.length - 1 || list[index + 1][0] !== m[0],
          time: index === list.length - 1 ? '7:42 PM' : '', seen: me && index === list.length - 1 };
      }),
      dmIdeas: dmd.ideas.map(function (t) { return { label: t, pick: function () { self.setState({ dmDraft: t, dmGentle: false }); } }; }),
      dmDraft: dmDraft,
      setDmDraft: function (e) { self.setState({ dmDraft: e.target.value, dmGentle: false }); },
      dmKey: function (e) { if (e.key === 'Enter' && !dmHarsh) sendDm(); },
      dmHarsh: dmHarsh, dmNotHarsh: !dmHarsh, dmWhy: dmWhy,
      dmSayGently: function () { self.setState({ dmDraft: "Hmm, I'm not sure I agree. Can you tell me more?", dmGentle: true }); },
      dmSendAnyway: sendDm,
      sendDm: function () { if (!dmHarsh) sendDm(); },
      dmSendBg: dmDraft.trim() && !dmHarsh ? 'var(--ink)' : '#CFC8DB',
      dmBack: function () { self.setState({ screen: 'circles', cTab: 'dms', moOpen: false }); },
      dmJordan: openDm('jordan'), dmMaya: openDm('maya'),
      m1CanDm: !!dmData[cd.m1[0].toLowerCase()], m2CanDm: !!dmData[cd.m2[0].toLowerCase()],
      m1Dm: function () { var k = cd.m1[0].toLowerCase(); if (dmData[k]) openDm(k)(); },
      m2Dm: function () { var k = cd.m2[0].toLowerCase(); if (dmData[k]) openDm(k)(); },
    };

    // ---------- Notifications ----------
    var notifRead = !!s.notifRead;
    var notifPaused = !!s.notifPaused;
    var coachPending = (s.reqState || 'pending') === 'pending';
    var notifItems = [
      { group: 'new', icon: 'msg', title: 'Jordan sent you a message', body: '7 works? I can show you the Water Temple trick.', time: '2m', go: openDm('jordan') },
      { group: 'new', icon: 'cal', title: 'Coffee with Jordan and Maya is tomorrow', body: 'Sun · 11 AM · café. Mo will remind you 1 hour before.', time: '1h', go: go('home') },
      { group: 'new', icon: 'person', title: coachPending ? 'Coach Maria wants to connect' : 'Coach Maria request', body: coachPending ? 'She won’t see anything unless you choose.' : 'You already answered this.', time: '3h', go: go('me') },
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
      pauseBg: notifPaused ? 'var(--ink)' : 'rgba(255,255,255,0.85)', pauseFg: notifPaused ? '#FFFFFF' : 'var(--ink)',
      togglePause: function () { changeWithUndo({ notifPaused: !notifPaused }, notifPaused ? 'Notifications resumed' : 'Notifications paused for 1 hour', { notifPaused: notifPaused }); },
      notifMoLine: notifPaused ? 'Notifications are paused. I’ll still let your trusted people reach you if you need help.' : 'I bundle notifications so they don’t pile up. Tap one to go there.'
    };

    // ---------- Themes ----------
    var themes = {
      dawn: { name: 'Dawn', desc: 'Soft peach and lilac', swatch: 'linear-gradient(135deg, #F7CFC6, #B9A6E3)', bg: 'linear-gradient(170deg, #FBE6DD 0%, #F1E4F3 45%, #DFE3FA 100%)', bar: 'rgba(251,232,226,0.97)', ink: '#3B3350', soft: '#EFE6F8', muted: '#5E5574' },
      sage: { name: 'Sage', desc: 'Quiet greens', swatch: 'linear-gradient(135deg, #CFE5D2, #5E8B74)', bg: 'linear-gradient(170deg, #EAF2E6 0%, #E5EFE8 50%, #DDEBEC 100%)', bar: 'rgba(234,242,231,0.97)', ink: '#2F4A3F', soft: '#DCEBE0', muted: '#4F5F57' },
      mist: { name: 'Mist', desc: 'Cool blue-grey', swatch: 'linear-gradient(135deg, #D3E1F2, #5F7BA6)', bg: 'linear-gradient(170deg, #E6EEF8 0%, #E7ECF7 50%, #EEF0F6 100%)', bar: 'rgba(230,238,248,0.97)', ink: '#2F3F5A', soft: '#DFE7F4', muted: '#505C70' },
      sand: { name: 'Sand', desc: 'Warm and low-contrast', swatch: 'linear-gradient(135deg, #F1E3CF, #A88A6E)', bg: 'linear-gradient(170deg, #F6EFE4 0%, #F2EAE1 50%, #ECE5EC 100%)', bar: 'rgba(246,239,228,0.97)', ink: '#4A3D34', soft: '#EFE5D8', muted: '#665A50' }
    };
    var themeKey = themes[s.theme] ? s.theme : 'dawn';
    var th = themes[themeKey];
    var themeVals = {
      themeVars: { '--bg': th.bg, '--bar': th.bar, '--ink': th.ink, '--soft': th.soft, '--muted': th.muted },
      themeName: th.name,
      themeOpts: Object.keys(themes).map(function (k) {
        var t = themes[k]; var on = k === themeKey;
        return { name: t.name, desc: t.desc, bg: t.bg, ink: t.ink, swatch: t.swatch, on: on,
          ring: on ? '0 0 0 2px ' + t.ink : '0 0 0 1px rgba(0,0,0,0.08)',
          pick: function () { if (k !== themeKey) changeWithUndo({ theme: k }, 'Saved ✓', { theme: themeKey }); } };
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
    var fallbackDates = { e0: ['YESTERDAY','8'], e1: ['FRI','7'], e2: ['SAT','8'], e3: ['SUN','9'], e4: ['THU','6'] };
    var detailDate = evD.dateDay ? [evD.dateDay, evD.dateNum] : (fallbackDates[evD.id] || ['SUN','9']);
    var detailTimes = evD.start ? evD.start + ' – ' + evD.end + ' · ' + evD.duration : (evD.id === 'e3' ? '11:00 AM – 12:00 PM · 1 hr' : (evD.when || '').replace(' · ', ' · '));
    var detailVenue = evD.venue || (inPersonD ? ((evD.where || '').indexOf('library') >= 0 ? 'Tempe Public Library' : 'Cartel Coffee Lab') : '');
    var detailAddress = evD.address || (detailVenue === 'Tempe Public Library' ? '3500 S Rural Rd' : '225 W University Dr, Tempe');
    var detailRsvp = rsvp[evD.id] || '';
    var setDetailRsvp = function (value) { var r = Object.assign({}, rsvp); r[evD.id] = value; changeWithUndo({ rsvp: r }, value === 'going' ? "You're going ✓" : (value === 'maybe' ? 'Maybe saved' : "You can't go"), { rsvp: rsvp }); };
    var evDetailVals = {
      isEvent: screen === 'event',
      edBack: go(s.evBackTo === 'circle' ? 'circle' : 'home'),
      edTitle: evD.title, edWhen: evD.when, edWhere: evD.where, edMeta: (evD.duration || '1 hr') + ' · ' + Math.max(1, evD.going || 0) + ' people',
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
        { label: 'People', value: evD.size || '-', path: 'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 15.3c.8-.2 1.6-.3 2.5-.3 3 0 5 1.5 5.5 5' },
        { label: 'Sound', value: evD.sound || '-', path: 'M4 10v4h4l5 4V6L8 10H4ZM16.5 9a4 4 0 0 1 0 6' },
        { label: 'Lighting', value: evD.light || '-', path: 'M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' },
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
        return { label: f[1], bg: on ? 'var(--ink)' : 'rgba(255,255,255,0.9)', fg: on ? '#FFFFFF' : 'var(--ink)', pick: function () { setRefl({ feel: f[0] }); } };
      }),
      edWins: winsList.map(function (w) {
        var on = (refl.wins || []).indexOf(w) >= 0;
        return { label: w, bg: on ? 'var(--ink)' : 'rgba(255,255,255,0.9)', fg: on ? '#FFFFFF' : 'var(--ink)',
          pick: function () { var cur = refl.wins || []; setRefl({ wins: on ? cur.filter(function (x) { return x !== w; }) : cur.concat([w]) }); } };
      }),
      edCanSave: !!refl.feel, edSaveBg: refl.feel ? 'var(--ink)' : '#CFC8DB',
      edSaveRefl: function () { if (refl.feel) { var all = Object.assign({}, s.refl || {}); all[evD.id] = Object.assign({}, refl, { done: true }); changeWithUndo({ refl: all }, '+1 brave step', { refl: s.refl || {} }); } },
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
    var trustedPhone = s.trustedPhone === undefined ? '(480) 555-0142' : s.trustedPhone;
    var trustedEmail = s.trustedEmail || '';
    var interestText = interests.map(function (k) { return circleData[k] ? circleData[k].name.toLowerCase() : k; }).slice(0, 2).join(' and ') || 'new things';
    var segOpts = function (list, cur, key) {
      return list.map(function (pair) {
        var on = pair[0] === cur; var o = {}; o[key] = pair[0];
        var previous = {}; previous[key] = cur;
        return { label: pair[1], on: on, cls: on ? 'on' : '', pick: function () { if (!on) changeWithUndo(o, 'Saved ✓', previous); } };
      });
    };
    var onbOk = onbStep === 2 ? interests.length > 0 : (onbStep === 4 ? (!!(s.trusted === undefined ? 'Mom' : s.trusted).trim() && trustedPhone.replace(/\D/g, '').length >= 10 && (!trustedEmail || /.+@.+\..+/.test(trustedEmail))) : true);
    var onbVals = {
      isOnboard: screen === 'onboard',
      onbStep: onbStep, onbStepText: 'Step ' + (onbStep - 1) + ' of 5', onbShowProgress: onbStep > 1,
      onbPct: Math.round(((onbStep - 1) / 5) * 100) + '%',
      onb1: onbStep === 1, onb2: onbStep === 2, onb3: onbStep === 3, onb4: onbStep === 4, onb5: onbStep === 5, onb6: onbStep === 6,
      onbBack: function () { self.setState({ onbStep: Math.max(1, onbStep - 1) }); },
      onbNext: function () { if (!onbOk) return; if (onbStep >= 6) { self.setState({ onbDone: true, screen: 'checkin' }); } else { self.setState({ onbStep: onbStep + 1 }); } },
      onbNextLabel: onbStep === 1 ? 'Get started' : (onbStep === 6 ? 'I understand' : 'Next'),
      onbNextBg: onbOk ? 'var(--ink)' : '#CFC8DB',
      interestOpts: Object.keys(circleData).map(function (k) {
        var on = interests.indexOf(k) >= 0;
        return { key: k, name: circleData[k].name, tint: circleData[k].tint, on: on,
          ring: on ? '0 0 0 2px var(--ink)' : '0 0 0 1px rgba(0,0,0,0.06)',
          pick: function () { var next = on ? interests.filter(function (x) { return x !== k; }) : interests.concat([k]); if (next.length) changeWithUndo({ interests: next }, 'Saved ✓', { interests: interests }); } };
      }),
      interestCount: interests.length ? interests.length + ' picked' : 'Pick at least one',
      trustedInput: s.trusted === undefined ? 'Mom' : s.trusted, trusted: trusted, trustedRel: trustedRel,
      setTrusted: function (e) { self.setState({ trusted: e.target.value, helpTo: '' }); },
      trustedPhone: trustedPhone, trustedEmail: trustedEmail,
      setTrustedPhone: function (e) { self.setState({ trustedPhone: e.target.value }); },
      setTrustedEmail: function (e) { self.setState({ trustedEmail: e.target.value }); },
      phoneHint: trustedPhone.replace(/\D/g, '').length >= 10 ? '' : 'Add a 10-digit number so Mo can text them.',
      emailHint: (!trustedEmail || /.+@.+\..+/.test(trustedEmail)) ? '' : 'Check the email address, or leave it blank.',
      trustedContact: trustedPhone + (trustedEmail ? ' · ' + trustedEmail : ''),
      relOpts: ['Parent', 'Sibling', 'Friend', 'Coach', 'Other'].map(function (r) {
        var on = r === trustedRel;
        return { label: r, on: on, bg: on ? 'var(--ink)' : 'rgba(255,255,255,0.85)', fg: on ? '#FFFFFF' : 'var(--ink)', pick: function () { self.setState({ trustedRel: r }); } };
      }),
      sizeSeg: segOpts([[false, 'Default'], [true, 'Large']], textLarge, 'textLarge'),
      calmSeg: segOpts([[false, 'Off'], [true, 'On']], calmMode, 'calmMode'),
      chatSeg: segOpts([[true, 'Text first'], [false, 'Voice is okay']], textFirst, 'textFirst'),
      appClass: 'bridge-app' + (calmMode ? ' calm-mode' : '') + (textLarge ? ' text-large' : ''),
      journey: [['Oct 13', 1], ['Oct 20', 2], ['Oct 27', 3], ['This week', steps]].map(function (w, i, all) {
        var max = Math.max.apply(null, all.map(function (x) { return x[1]; })) || 1;
        return { label: w[0], value: w[1], h: Math.max(10, Math.round((w[1] / max) * 84)) + 'px', bg: i === all.length - 1 ? 'var(--ink)' : 'var(--soft)' };
      }),
      journeyUp: steps > 3 ? 'Up from 3 last week' : 'Every step counts',
      redoSetup: function () { self.setState({ screen: 'onboard', onbStep: 2, moOpen: false }); }
    };
    var openMeScreen = function (target) {
      return function () {
        var el = document.querySelector('.bridge-scroll');
        self.setState({ screen: target, meScroll: el ? el.scrollTop : 0, moOpen: false });
      };
    };
    var meScreenNames = ['me-journey','me-trusted','me-coach','me-profile','me-colors','me-comfort','me-interests','me-privacy'];
    var meVals = {
      isMeJourney: screen === 'me-journey', isMeTrusted: screen === 'me-trusted', isMeCoach: screen === 'me-coach',
      isMeProfile: screen === 'me-profile', isMeColors: screen === 'me-colors', isMeComfort: screen === 'me-comfort',
      isMeInterests: screen === 'me-interests', isMePrivacy: screen === 'me-privacy',
      meBack: function () { self.setState({ screen: 'me', moOpen: false }); },
      interestNames: interests.map(function (k) { return circleData[k] ? circleData[k].name : k; }).join(' · '),
      interestTotal: interests.length,
      openJourney: openMeScreen('me-journey'), openTrusted: openMeScreen('me-trusted'), openCoach: openMeScreen('me-coach'),
      openProfile: openMeScreen('me-profile'), openColors: openMeScreen('me-colors'), openComfort: openMeScreen('me-comfort'),
      openInterests: openMeScreen('me-interests'), openPrivacy: openMeScreen('me-privacy'),
      showCoachPerson: reqState === 'choose' || reqState === 'connected',
      comfortSummary: textLarge ? 'Large text' : (calmMode ? 'Calm mode on' : (textFirst ? 'Text first' : 'Voice is okay')),
      blockedSummary: (dmReqState === 'reported' || (s.safetyNote || '').toLowerCase().indexOf('blocked') >= 0) ? 'Alex' : 'No blocked people',
      meSettings: [
        { label: 'Profile', value: '', path: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 21c.8-4 3.3-6 7.5-6s6.7 2 7.5 6', open: openMeScreen('me-profile') },
        { label: 'Colors', value: themeVals.themeName, swatch: th.swatch, path: 'M12 3a9 9 0 1 0 0 18c1.6 0 2.2-1.2 1.5-2.3-.6-1 .1-2.2 1.3-2.2H17a4 4 0 0 0 4-4C21 7.3 17 3 12 3Z', open: openMeScreen('me-colors') },
        { label: 'Comfort', value: textLarge ? 'Large' : (calmMode ? 'Calm' : 'Default'), path: 'M4 12h16M12 4v16M6.5 6.5l11 11M17.5 6.5l-11 11', open: openMeScreen('me-comfort') },
        { label: 'Interests', value: interests.length + ' picked', path: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z', open: openMeScreen('me-interests') },
        { label: 'Privacy & safety', value: '', path: 'M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z', open: openMeScreen('me-privacy') }
      ],
      isMeArea: screen === 'me' || meScreenNames.indexOf(screen) >= 0
    };
    return Object.assign(evVals, profVals, dmVals, notifVals, themeVals, evDetailVals, onbVals, meVals, {
      circles: circles, screenKey: screen, uiToast: s.uiToast || '', hasUiToast: !!s.uiToast, hasUndo: !!s.undoPatch,
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
      showTabs: ['pause', 'reset', 'win', 'checkin', 'help', 'newEvent', 'onboard'].indexOf(screen) < 0,
      steps: steps,
      homeMood: ciFeel === 'over' ? 'calm' : 'happy',
      moLine: ciFeel === 'over' ? "Thanks for telling me. Let's keep today gentle. Just reading a circle counts." : (ciFeel === 'ready' ? "You're ready to connect! Let's practice, then go for it." : (ciUp === 'none' ? "Let's warm up with one small practice today." : "Let's warm up for your " + upLabels[ciUp].toLowerCase().replace('a ', '') + '.')),
      isLow: battery === 'low', isOkay: battery === 'okay', isFull: battery === 'full',
      lowBg: pick(battery === 'low'), okayBg: pick(battery === 'okay'), fullBg: pick(battery === 'full'),
      lowFg: pickFg(battery === 'low'), okayFg: pickFg(battery === 'okay'), fullFg: pickFg(battery === 'full'),
      setLow: function () { self.setState({ battery: 'low' }); },
      setOkay: function () { self.setState({ battery: 'okay' }); },
      setFull: function () { self.setState({ battery: 'full' }); },
      goHome: go('home'), goCircle: go('circle'), goPractice: go('practice', { pChoice: '', pStarted: false, pTyped: '', pOwn: '', pHintUsed: false }), goMe: go('me'),
      goReset: go('reset', { trustSent: false }), goFeedback: go('feedback'),
      menuOpen: !!s.menuOpen,
      toggleMenu: function () { self.setState({ menuOpen: !s.menuOpen }); },
      doReport: function () { changeWithUndo({ menuOpen: false, safetyNote: 'Thanks. A moderator will check this chat.' }, 'Report sent', { menuOpen: !!s.menuOpen, safetyNote: s.safetyNote || '' }); },
      doBlock: function () { changeWithUndo({ menuOpen: false, safetyNote: 'Done. You can block anyone, anytime.' }, 'Member blocked', { menuOpen: !!s.menuOpen, safetyNote: s.safetyNote || '' }); },
      hasSafetyNote: !!s.safetyNote, safetyNote: s.safetyNote || '',
      isSent: !!sent,
      sentText: drafts[sent] || '',
      jordanReply: replies[sent] || '',
      resultMood: sentKind ? 'happy' : 'calm',
      resultLine: sentKind ? cd.m2[0] + ' replied! That was a brave step.' : "Sent. If it didn't land well, I can help you follow up.",
      resultButton: sentKind ? 'Get my badge' : 'Help me follow up',
      resultAction: sentKind ? function () { changeWithUndo({ screen: 'win', won: true, winType: sent === 'kind' ? 'kind' : 'hello' }, '+1 brave step', { screen: screen, won: !!s.won, winType: s.winType }); } : go('practice', { pChoice: '', pStarted: false }),
      showSuggest: !sent && !draft && !readOnly,
      showComposer: !sent && !readOnly,
      chipAsk: function () { self.setState({ draft: 'ask' }); },
      chipShare: function () { self.setState({ draft: 'share' }); },
      chipOwn: function () { self.setState({ draft: 'angry' }); },
      hasDraft: !!draft,
      draftShown: draft ? drafts[draft] : 'Message the ' + cd.name + ' circle',
      draftColor: draft ? 'var(--ink)' : 'var(--muted)',
      draftRing: isAngry ? '0 0 0 2px #EE9F95' : 'none',
      toneBg: isAngry ? '#FBE1DC' : '#DDF1E6',
      toneDot: isAngry ? 'var(--ink)' : '#5DBB8E',
      toneLabel: isAngry ? 'Mo: this might sound harsh' : 'Mo: sounds friendly',
      toneWhy: isAngry ? 'Why: "Seriously" and "overrated" can sound like you are making fun of what ' + cd.m2[0] + ' loves.' : '', hasToneWhy: isAngry,
      sendBg: draft ? 'var(--ink)' : 'rgba(255,255,255,0.7)',
      sendIcon: draft ? '#FFFFFF' : '#8C83A0',
      send: function () {
        if (!draft) return;
        if (draft === 'angry') self.setState({ screen: 'pause' });
        else changeWithUndo({ sent: draft, draft: '' }, 'Sent to ' + cd.name + ' chat', { sent: sent, draft: draft });
      },
      sayKindly: go('circle', { draft: 'kind' }),
      sendAnyway: go('circle', { sent: 'angry', draft: '' }),
      walkBg: pick(plan === 'walk'), musicBg: pick(plan === 'music'), waterBg: pick(plan === 'water'),
      walkFg: pickFg(plan === 'walk'), musicFg: pickFg(plan === 'music'), waterFg: pickFg(plan === 'water'),
      planWalk: function () { self.setState({ plan: 'walk' }); },
      planMusic: function () { self.setState({ plan: 'music' }); },
      planWater: function () { self.setState({ plan: 'water' }); },
      readyAfterReset: go('circle', { draft: 'kind' }),
      textTrusted: function () { changeWithUndo({ trustSent: true }, 'Text sent to ' + trusted, { trustSent: !!s.trustSent }); },
      trustSent: !!s.trustSent,
      pChosen: !!pChoice, pNotChosen: !pChoice,
      pText: pChoice === 'own' ? pOwn : (choiceGood ? ps.good : ps.vague),
      pReply: choiceGood ? ps.goodReply : ps.vagueReply,
      pTitle: ps.title, pPartner: ps.partner, pOpener: ps.opener, pHint: ps.hint,
      pGoodText: ps.good, pVagueText: ps.vague,
      showHint: pLevel === 1 || (pLevel === 2 && pHintUsed),
      levelLabel: levelNames[pLevel - 1],
      pPicking: !pStarted, pStarted: pStarted,
      recScenarios: recScenarios, moreScenarios: moreScenarios, pScene: ps.scene, levels: levelList,
      startPractice: function () { self.setState({ pStarted: true, pChoice: '', pTyped: '', pOwn: '', pHintUsed: false }); },
      levelExplain: pLevel === 1 ? 'Guided: Mo shows a hint and two replies to choose from.' : (pLevel === 2 ? 'Light help: choose a reply. Ask Mo for one hint only if you need it.' : 'On your own: no choices. Type your reply like a real chat, and Mo gives feedback after.'),
      pShowChoices: !pChoice && pLevel < 3, pShowType: !pChoice && pLevel === 3,
      pChoiceVagueFirst: pLevel === 2, pChoiceGoodFirst: pLevel !== 2,
      pHintAsk: !pChoice && pLevel === 2 && !pHintUsed,
      askHint: function () { self.setState({ pHintUsed: true }); },
      pTyped: pTyped,
      setTyped: function (e) { self.setState({ pTyped: e.target.value }); },
      sendTyped: function () { if (pTyped.trim()) self.setState({ pOwn: pTyped.trim(), pChoice: 'own', pTyped: '' }); },
      typedKey: function (e) { if (e.key === 'Enter' && pTyped.trim()) self.setState({ pOwn: pTyped.trim(), pChoice: 'own', pTyped: '' }); },
      typedSendBg: pTyped.trim() ? 'var(--ink)' : '#CFC8DB',
      typedHasTone: pTyped.trim().length > 0,
      typedTone: typedEv.harsh ? 'Might sound harsh' : (typedEv.words < 4 ? 'A bit short' : ((typedEv.asks || typedEv.kind) ? 'Sounds friendly' : 'Okay so far')),
      typedDot: typedEv.harsh ? 'var(--ink)' : (typedEv.words < 4 ? '#E3B341' : '#5DBB8E'),
      typedToneBg: typedEv.harsh ? '#FBE1DC' : (typedEv.words < 4 ? '#FBF0D6' : '#DDF1E6'),
      fbIsOwn: pChoice === 'own', fbExample: ps.good,
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
      unsafeIgnore: function () { self.setState({ unsafeHandled: true }); },
      reqPending: reqState === 'pending', reqChoose: reqState === 'choose', reqDeclined: reqState === 'declined',
      mariaConnected: reqState === 'connected',
      reqAccept: function () { var el = document.querySelector('.bridge-scroll'); self.setState({ reqState: 'choose', screen: 'me-coach', meScroll: el ? el.scrollTop : 0 }); },
      reqDecline: function () { self.setState({ reqState: 'declined' }); },
      reqConnect: function () { changeWithUndo({ reqState: 'connected' }, 'Saved ✓', { reqState: reqState }); },
      seeSteps: seeSteps, seeHelp: seeHelp,
      seeStepsBg: seeSteps ? 'var(--ink)' : 'var(--soft)', seeStepsFg: seeSteps ? '#FFFFFF' : 'var(--ink)',
      seeHelpBg: seeHelp ? 'var(--ink)' : 'var(--soft)', seeHelpFg: seeHelp ? '#FFFFFF' : 'var(--ink)',
      toggleSeeSteps: function () { changeWithUndo({ seeSteps: !seeSteps }, 'Saved ✓', { seeSteps: seeSteps }); },
      toggleSeeHelp: function () { changeWithUndo({ seeHelp: !seeHelp }, 'Saved ✓', { seeHelp: seeHelp }); },
      mariaSees: (seeSteps && seeHelp) ? 'Sees my brave steps and help texts' : (seeSteps ? 'Sees my brave steps' : (seeHelp ? 'Gets my "I need help" texts' : 'Connected, sees nothing yet')),
      showFloat: ['practice', 'feedback'].indexOf(screen) < 0,
      showMoMenu: !!s.moOpen && ['practice', 'feedback'].indexOf(screen) < 0,
      finishWin: go('me'),
      momOn: momOn, mariaOn: mariaOn,
      momBg: momOn ? '#5DBB8E' : '#DCD5E8', momJustify: momOn ? 'flex-end' : 'flex-start',
      mariaBg: mariaOn ? '#5DBB8E' : '#DCD5E8', mariaJustify: mariaOn ? 'flex-end' : 'flex-start',
      toggleMom: function () { self.setState({ momOn: !momOn }); },
      toggleMaria: function () { self.setState({ mariaOn: !mariaOn }); },
      isCheckin: screen === 'checkin', isHelp: screen === 'help',
      feelOpts: chip(feelLabels, ciFeel, 'ciFeel'), upOpts: chip(upLabels, ciUp, 'ciUp'),
      hardOpts: chip({ start: 'Starting a chat', keep: 'Keeping it going', tone: 'Reading tone', disagree: 'Disagreeing', leave: 'Leaving or saying no' }, ciHard, 'ciHard'),
      finishCheckin: go('home'), goCheckin: go('checkin'),
      ciSummary: feelLabels[ciFeel] + (ciUp === 'none' ? '' : ' · ' + (ciUp === 'group' ? 'hangout' : upLabels[ciUp].toLowerCase().replace('a ', '')) + ' coming up'),
      recList: recList, upNextText: upNextText,
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
        var grads = { gaming: 'linear-gradient(120deg, #F9DCE4, #E3E0F8)', music: 'linear-gradient(120deg, #E3E0F8, #DCE4FA)', anime: 'linear-gradient(120deg, #FBE1D8, #F9DCE4)', cooking: 'linear-gradient(120deg, #DDF1E6, #F6E5C9)', art: 'linear-gradient(120deg, #F6E5C9, #FBE1D8)', tech: 'linear-gradient(120deg, #DCE4FA, #DDF1E6)' };
        return { key: k, name: c.name, here: c.here, topic: c.topic, grad: grads[k], tint: c.tint, icon: circleIconPaths[k], avatars: [c.m1[0], c.m2[0], c.m3 ? c.m3[0] : 'Sam'],
          open: function () { self.setState({ screen: 'circle', circle: k, draft: '', sent: '', readOnly: false, unsafeHandled: false, moOpen: false, safetyNote: '' }); },
          read: function () { self.setState({ screen: 'circle', circle: k, draft: '', sent: '', readOnly: true, unsafeHandled: false, moOpen: false, safetyNote: '' }); } };
      }),
      isReadOnly: readOnly,
      stopReading: function () { self.setState({ readOnly: false }); },
      helpTo: helpTo, helpSent: !!s.helpSent, helpNotSent: !s.helpSent,
      helpPeople: (reqState === 'connected' ? [trusted, 'Coach Maria'] : [trusted]).map(function (n) {
        var on = n === helpTo;
        return { name: n, on: on, bg: on ? 'var(--ink)' : 'var(--soft)', fg: on ? '#FFFFFF' : 'var(--ink)', pick: function () { self.setState({ helpTo: n, helpSent: false }); } };
      }),
      sendHelp: function () { changeWithUndo({ helpSent: true }, 'Sent to ' + helpTo, { helpSent: !!s.helpSent }); },
      tabIsHome: screen === 'home', tabIsCircles: screen === 'circles' || screen === 'circle' || screen === 'dm', tabIsMe: screen === 'me' || meScreenNames.indexOf(screen) >= 0,
      homeBg: screen === 'home' ? '#FFFFFF' : 'transparent', homeFg: screen === 'home' ? 'var(--ink)' : '#D9D3E8', homePad: screen === 'home' ? '0 18px' : '0',
      circlesBg: (screen === 'circles' || screen === 'circle' || screen === 'dm') ? '#FFFFFF' : 'transparent', circlesFg: (screen === 'circles' || screen === 'circle' || screen === 'dm') ? 'var(--ink)' : '#D9D3E8', circlesPad: (screen === 'circles' || screen === 'circle' || screen === 'dm') ? '0 18px' : '0',
      meBg: (screen === 'me' || meScreenNames.indexOf(screen) >= 0) ? '#FFFFFF' : 'transparent', meFg: (screen === 'me' || meScreenNames.indexOf(screen) >= 0) ? 'var(--ink)' : '#D9D3E8', mePad: (screen === 'me' || meScreenNames.indexOf(screen) >= 0) ? '0 18px' : '0',
      moBtnBg: s.moOpen ? '#FFFFFF' : 'var(--soft)',
      tabHomeBg: tab('home'), tabCircleBg: tab('circle'), tabMeBg: tab('me'),
      moOpen: !!s.moOpen,
      toggleMo: function () { self.setState({ moOpen: !s.moOpen }); },
      moBottom: screen === 'circle' ? '200px' : '100px',
      menuBottom: screen === 'circle' ? '280px' : '180px',
      floatMood: (screen === 'circle' && isAngry) ? 'worried' : (battery === 'low' && screen === 'home' ? 'calm' : 'happy'),
      moPracticeHint: screen === 'circle' ? 'Practice replying to ' + cd.m2[0] : (screen === 'home' ? 'Practice inviting someone' : 'Practice a conversation'),
      moPractice: go('practice', { pChoice: '', pStarted: false }),
      moBreathe: go('reset', { trustSent: false }),
      moHelp: go('help', { helpSent: false })
    });
  }
}

class Bridge extends BridgeBase {
  componentDidUpdate(prevProps, prevState) {
    if (prevState.screen !== this.state.screen) {
      // A toast from an earlier screen shouldn't follow you to the next one
      if (this.state.uiToast && prevState.undoToken === this.state.undoToken && prevState.uiToast === this.state.uiToast) {
        this.setState({ uiToast: '', undoPatch: null, undoToken: 0 });
      }
      var el = document.querySelector('.bridge-scroll');
      if (el && this.state.screen === 'me' && String(prevState.screen).indexOf('me-') === 0) {
        var saved = this.state.meScroll || 0;
        requestAnimationFrame(function () { el.scrollTop = saved; });
      } else if (el) el.scrollTop = 0;
      var order = { onboard: -1, checkin: 0, home: 1, circles: 2, circle: 3, dm: 3, notifs: 2, newEvent: 3, event: 3, practice: 3, feedback: 4, pause: 4, reset: 5, help: 4, me: 1, 'me-journey': 2, 'me-trusted': 2, 'me-coach': 2, 'me-profile': 2, 'me-colors': 2, 'me-comfort': 2, 'me-interests': 2, 'me-privacy': 2, win: 5 };
      var panel = document.querySelector('.screen-transition');
      if (panel && (order[this.state.screen] || 0) < (order[prevState.screen] || 0)) {
        panel.classList.add('screen-back');
      }
    }
  }
  renderView(v) {
    return (<>
<div className={v.appClass} style={{...v.themeVars, width: "100%", height: "100%", boxSizing: "border-box", background: "var(--bg)", fontFamily: "Outfit, system-ui, sans-serif", color: "var(--ink)", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative"}}>
<StatusBar />
<div className="bridge-scroll" style={{flex: "1", minHeight: "0", overflowY: "auto", overflowX: "hidden", width: "100%"}}>
<div key={v.screenKey} className="screen-transition">

{v.isOnboard && (<>
<div className="onb">
<div className="onb-top">
{v.onbShowProgress && (<>
<button onClick={v.onbBack} aria-label="Back" className="onb-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg></button>
<div className="event-progress" style={{flex: "1"}}><div><i style={{width: v.onbPct}}></i></div><span>{v.onbStepText}</span></div>
</>)}
</div>

{v.onb1 && (<>
<div className="onb-body onb-center">
<div className="floaty"><Mo mood="happy" size={136} /></div>
<span className="onb-brand">Bridge</span>
<h1 className="onb-title">Make friends at your own pace</h1>
<div className="onb-list">
<div><span className="onb-dot"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="9" r="3"></circle><circle cx="16" cy="9" r="3"></circle><path d="M2.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 15.3c.8-.2 1.6-.3 2.5-.3 3 0 5 1.5 5.5 5"></path></svg></span>Join small circles about things you love</div>
<div><span className="onb-dot"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5h16v11H9l-5 4v-15Z"></path></svg></span>Practice with Mo before the real thing</div>
<div><span className="onb-dot"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z"></path></svg></span>You decide what to share, always</div>
</div>
<span style={{fontSize: "14px", color: "var(--muted)"}}>Setup takes about 2 minutes.</span>
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
</div>
<span className="onb-sub">{v.interestCount}</span>
</div>
</>)}

{v.onb3 && (<>
<div className="onb-body">
<div style={{display: "flex", alignItems: "center", gap: "14px"}}><Mo mood="happy" size={88} /><div style={{display: "flex", flexDirection: "column", gap: "4px"}}><h1 className="onb-title" style={{textAlign: "left"}}>Meet Mo</h1><span className="onb-sub" style={{textAlign: "left"}}>Your AI buddy. Mo is here to help, not to judge.</span></div></div>
<div className="onb-card">
<strong>Mo can</strong>
<span>✓ Help you practice conversations</span>
<span>✓ Suggest replies and check your tone</span>
<span>✓ Explain why something might sound harsh</span>
<span>✓ Help you calm down when it's a lot</span>
</div>
<div className="onb-card soft">
<strong>Mo won't</strong>
<span>✕ Send messages for you</span>
<span>✕ Share your chats with anyone</span>
<span>✕ Replace a doctor or therapist</span>
</div>
</div>
</>)}

{v.onb4 && (<>
<div className="onb-body">
<h1 className="onb-title">Who can you count on?</h1>
<span className="onb-sub">When you tap "I need help", Mo texts this person. They never see your chats.</span>
<label className="onb-field">Their name<input type="text" value={v.trustedInput} onChange={v.setTrusted} placeholder="For example, Mom or Alex" autoComplete="off" /></label>
<label className="onb-field">Phone number<input type="tel" inputMode="tel" value={v.trustedPhone} onChange={v.setTrustedPhone} placeholder="(480) 555-0142" autoComplete="off" /></label>
{v.phoneHint && (<><span className="field-hint">{v.phoneHint}</span></>)}
<label className="onb-field">Email (optional)<input type="email" value={v.trustedEmail} onChange={v.setTrustedEmail} placeholder="Backup if a text doesn't go through" autoComplete="off" /></label>
{v.emailHint && (<><span className="field-hint">{v.emailHint}</span></>)}
<span style={{fontSize: "15px", fontWeight: "600"}}>They are my</span>
<div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
{v.relOpts.map((o, $i) => (<React.Fragment key={$i}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "44px", borderRadius: "999px", border: "none", background: o.bg, color: o.fg, padding: "8px 16px", fontSize: "15px", fontWeight: "500"}}>{o.label}</button>
</React.Fragment>))}
</div>
<span className="onb-sub" style={{textAlign: "left"}}>You can change this anytime in Me.</span>
</div>
</>)}

{v.onb5 && (<>
<div className="onb-body">
<h1 className="onb-title">Make it comfortable</h1>
<span className="onb-sub">Changes show right away. You can change them later in Me.</span>
<span style={{fontSize: "15px", fontWeight: "600"}}>Colors</span>
<div style={{display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px"}}>
{v.themeOpts.map((t, $index) => (<React.Fragment key={$index}>
<button onClick={t.pick} aria-pressed={t.on} aria-label={"Theme: " + t.name} style={{display: "flex", alignItems: "center", gap: "12px", border: "none", borderRadius: "16px", padding: "10px 12px", background: "rgba(255,255,255,0.85)", boxShadow: t.ring, color: "var(--ink)", textAlign: "left"}}>
<span style={{flex: "0 0 auto", width: "32px", height: "32px", borderRadius: "50%", background: t.swatch, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)"}}></span>
<span style={{flex: "1", fontSize: "16px", fontWeight: "500"}}>{t.name}</span>
{t.on && (<><span aria-hidden="true" style={{fontSize: "15px"}}>✓</span></>)}
</button>
</React.Fragment>))}
</div>
<div className="comfort-card">
<div className="segmented-row"><span>Text size</span><div className="segments">{v.sizeSeg.map((o, $i) => (<React.Fragment key={$i}><button className={o.cls} aria-pressed={o.on} onClick={o.pick}>{o.label}</button></React.Fragment>))}</div></div>
<div className="segmented-row"><span>Calm mode</span><div className="segments">{v.calmSeg.map((o, $i) => (<React.Fragment key={$i}><button className={o.cls} aria-pressed={o.on} onClick={o.pick}>{o.label}</button></React.Fragment>))}</div></div>
<div className="segmented-row"><span>Chatting</span><div className="segments">{v.chatSeg.map((o, $i) => (<React.Fragment key={$i}><button className={o.cls} aria-pressed={o.on} onClick={o.pick}>{o.label}</button></React.Fragment>))}</div></div>
</div>
<div style={{display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.6)", borderRadius: "20px", padding: "12px 14px"}}><span style={{flex: "0 0 auto"}}><Mo mood="calm" size={40} /></span><span style={{fontSize: "14px", lineHeight: "1.4"}}>Calm mode turns off moving animations. Text first means circles and events start in text, and voice is always optional.</span></div>
</div>
</>)}

{v.onb6 && (<>
<div className="onb-body">
<h1 className="onb-title">A few safety rules</h1>
<span className="onb-sub">Short and simple. Mo will remind you if something looks wrong.</span>
<div className="onb-card">
<span className="safety-row"><b>1</b>Never share your address, passwords or money.</span>
<span className="safety-row"><b>2</b>If someone asks for secrets or money, Mo warns you privately.</span>
<span className="safety-row"><b>3</b>You can leave, mute or block anyone, anytime. They are not told why.</span>
<span className="safety-row"><b>4</b>Need help now? Tap Mo, then "I need help", or call 988.</span>
</div>
</div>
</>)}

<div className="onb-foot">
<button onClick={v.onbNext} style={{width: "100%", height: "56px", borderRadius: "20px", border: "none", background: v.onbNextBg, color: "#FFFFFF", fontSize: "17px", fontWeight: "600"}}>{v.onbNextLabel}</button>
</div>
</div>
</>)}

{v.isCheckin && (<>
<div style={{padding: "32px 20px 110px", display: "flex", flexDirection: "column", gap: "20px"}}>
<div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center"}}>
<div><Mo mood="happy" size={96} /></div>
<h1 style={{margin: "0", fontSize: "28px", fontWeight: "600"}}>Hi {v.firstName}! Quick check-in</h1>
<span style={{fontSize: "16px", color: "var(--muted)"}}>Three taps. Mo uses this to plan today's practice.</span>
</div>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<span style={{fontSize: "17px", fontWeight: "600"}}>How are you feeling right now?</span>
<div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
{v.feelOpts.map((o, $index) => (<React.Fragment key={$index}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "46px", borderRadius: "999px", border: "none", background: o.bg, color: o.fg, padding: "8px 16px", fontSize: "15px", fontWeight: "500"}}>{o.label}</button>
</React.Fragment>))}
</div>
</div>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<span style={{fontSize: "17px", fontWeight: "600"}}>Anything coming up?</span>
<div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
{v.upOpts.map((o, $index) => (<React.Fragment key={$index}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "46px", borderRadius: "999px", border: "none", background: o.bg, color: o.fg, padding: "8px 16px", fontSize: "15px", fontWeight: "500"}}>{o.label}</button>
</React.Fragment>))}
</div>
</div>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<span style={{fontSize: "17px", fontWeight: "600"}}>What feels hardest lately?</span>
<div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
{v.hardOpts.map((o, $index) => (<React.Fragment key={$index}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "46px", borderRadius: "999px", border: "none", background: o.bg, color: o.fg, padding: "8px 16px", fontSize: "15px", fontWeight: "500"}}>{o.label}</button>
</React.Fragment>))}
</div>
</div>
</div>
<div className="sticky-cta"><button onClick={v.finishCheckin}>See my day</button></div>
</>)}

{v.isHome && (<>
<div className="tab-screen">
<div className="tab-sticky-header" style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px"}}>
<h1 style={{margin: "0", fontSize: "34px", fontWeight: "600", letterSpacing: "-0.5px"}}>Hi {v.firstName}</h1>
<div style={{display: "flex", alignItems: "center", gap: "8px"}}>
<span style={{background: "rgba(255,255,255,0.75)", borderRadius: "999px", padding: "7px 14px", fontSize: "14px", fontWeight: "500", whiteSpace: "nowrap"}}>{v.steps} brave steps</span>
<button onClick={v.openNotifs} aria-label={v.notifLabel} style={{position: "relative", width: "44px", height: "44px", flex: "0 0 auto", borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 0 0 4 0"></path></svg>
{v.hasNotifCount && (<><span style={{position: "absolute", top: "-2px", right: "-2px", minWidth: "20px", height: "20px", borderRadius: "999px", background: "#E0709A", color: "#FFFFFF", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", boxSizing: "border-box"}}>{v.notifCount}</span></>)}
</button>
</div>
</div>
<div className="tab-screen-content">
<div className="up-next-card">
<div style={{display: "flex", gap: "14px", alignItems: "flex-start"}}>
<div style={{flex: "0 0 auto"}}><Mo mood={v.homeMood} size={56} /></div>
<div style={{display: "flex", flexDirection: "column", gap: "4px", minWidth: "0"}}>
<span className="meta-label">Up next · about 2 min</span>
<span style={{fontSize: "18px", lineHeight: "1.35", fontWeight: "600"}}>{v.upNextText}</span>
</div>
</div>
<button className="primary-action" onClick={v.recList[0].start}>Start 2-minute practice</button>
<button className="quiet-action" onClick={() => document.getElementById('home-day')?.scrollIntoView({behavior: 'smooth'})}>Not now, just show me my day</button>
<div className="checkin-line"><span>{v.ciSummary}</span><button onClick={v.goCheckin}>Change</button></div>
</div>
<div id="home-day" className="calm-card" style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<div style={{display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px"}}>
<span className="section-title">Tonight in Gaming</span>
<span className="meta-pill">3 here now · usually quiet</span>
</div>
<h2 style={{margin: "0", fontSize: "18px", fontWeight: "600", lineHeight: "1.3"}}>What game got you hooked?</h2>
<button onClick={v.homeJoin} className="secondary-action">{v.joinLabel}</button>
</div>
{v.reflNudge && (<>
<button onClick={v.openPast} className="calm-card" style={{textAlign: "left", border: "none", display: "flex", gap: "12px", alignItems: "center", color: "var(--ink)"}}>
<Mo mood="happy" size={44} />
<span style={{flex: "1", display: "flex", flexDirection: "column", gap: "2px"}}>
<span className="section-title">Reflection</span>
<span style={{fontSize: "16px", fontWeight: "600"}}>How was Minecraft build night?</span>
</span>
<span className="meta-pill">1 min</span>
</button>
</>)}
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
<span className="section-title">My plans</span>
<button onClick={v.newEventHome} style={{height: "40px", borderRadius: "999px", border: "none", background: "rgba(255,255,255,0.85)", color: "var(--ink)", padding: "0 14px", fontSize: "15px", fontWeight: "500"}}>+ Create</button>
</div>
{v.hasEvToast && (<>
<div className="rise" style={{display: "flex", gap: "10px", alignItems: "center", background: "#E4F1F0", borderRadius: "20px", padding: "10px 14px"}}>
<Mo mood="happy" size={36} />
<span style={{fontSize: "14px", lineHeight: "1.4", color: "#2F5A47"}}>{v.evToast}</span>
</div>
</>)}
{v.noPlans && (<>
<div style={{background: "rgba(255,255,255,0.6)", borderRadius: "24px", padding: "16px", display: "flex", gap: "12px", alignItems: "center"}}>
<Mo mood="calm" size={44} />
<span style={{flex: "1", fontSize: "15px", lineHeight: "1.4", color: "var(--muted)"}}>No plans yet. Events you join in a circle will show up here.</span>
</div>
</>)}
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
{v.homeEvents.slice(0,2).map((ev, $index) => (<React.Fragment key={$index}>
<div className="event-row-card"><DateTile day={ev.day} date={ev.date}/><button onClick={ev.open} className="event-copy" style={{border:0,background:"transparent",textAlign:"left",padding:0,color:"var(--ink)"}}><strong>{ev.title}</strong><span>{ev.when}</span><span>{ev.where}</span><span className="meta-pill">{ev.meta}</span></button>{ev.notMine ? <button onClick={ev.toggle} style={{height:"40px",border:0,borderRadius:"14px",background:ev.inBg,color:ev.inFg,padding:"0 10px",fontWeight:"600"}}>{ev.inLabel}</button> : <span style={{fontSize:"14px",color:"var(--muted)"}}>Hosting</span>}
</div>
</React.Fragment>))}
</div>
{v.homeEvents.length > 2 && <button onClick={v.goCircles} className="quiet-action">See all ›</button>}
</div>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<span className="section-title">More practice</span>
{v.recList.slice(1,3).map((r, $index) => (<React.Fragment key={$index}>
<button onClick={r.start} className="calm-card" style={{textAlign: "left", border: "none", display: "flex", alignItems: "center", gap: "12px", color: "var(--ink)"}}>
<span style={{flex: "1", display: "flex", flexDirection: "column", gap: "4px"}}>
<span style={{fontSize: "17px", fontWeight: "600"}}>{r.title}</span>
<span style={{fontSize: "15px", lineHeight: "1.45", color: "var(--muted)"}}>{r.why}</span>
</span>
<span className="meta-pill">2 min</span>
</button>
</React.Fragment>))}
{v.recList.length > 3 && <button onClick={v.goPractice} className="quiet-action">See all ›</button>}
</div>
</div>
</div>
</>)}

{v.isHelp && (<>
<div style={{width: "100%", minHeight: "100%", boxSizing: "border-box", padding: "26px 20px 30px", display: "flex", flexDirection: "column", gap: "16px", background: "var(--bg)"}}>
<button onClick={v.goHome} aria-label="Back" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center"}}>
<Mo mood="calm" size={100} />
<h1 style={{margin: "0", fontSize: "30px", fontWeight: "600"}}>You're not alone</h1>
<span style={{fontSize: "16px", color: "var(--muted)"}}>Pick what feels right. Real people are here for you.</span>
</div>
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>Text someone I trust</span>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.helpPeople.map((p, $index) => (<React.Fragment key={$index}>
<button onClick={p.pick} aria-pressed={p.on} style={{minHeight: "44px", borderRadius: "999px", border: "none", background: p.bg, color: p.fg, padding: "8px 16px", fontSize: "15px", fontWeight: "500"}}>{p.name}</button>
</React.Fragment>))}
</div>
<div style={{background: "#F6F2FB", borderRadius: "18px", padding: "12px 14px", fontSize: "16px", lineHeight: "1.4"}}>"Can you call me when you're free? I'm having a hard time."</div>
{v.helpNotSent && (<>
<button onClick={v.sendHelp} style={{height: "50px", borderRadius: "18px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "500"}}>Send to {v.helpTo}</button>
</>)}
{v.helpSent && (<>
<span className="rise" style={{fontSize: "15px", color: "#3E6B57", textAlign: "center"}}>Sent to {v.helpTo}. Mo will stay with you until they reply.</span>
</>)}
</div>
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "10px"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>Talk to someone right now</span>
<span style={{fontSize: "15px", color: "var(--muted)"}}>Free, any time of day or night.</span>
<button style={{height: "50px", borderRadius: "18px", border: "none", background: "#FBE1DC", color: "var(--ink)", fontSize: "16px", fontWeight: "500"}}>Call 988</button>
</div>
<button onClick={v.goReset} style={{height: "44px", border: "none", background: "transparent", color: "var(--ink)", fontSize: "16px", fontWeight:"600"}}>Breathe with Mo first ›</button>
</div>
</>)}

{v.isCircles && (<>
<div className="tab-screen">
<div className="tab-sticky-header">
<h1 className="tab-page-title">Circles</h1>
<div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", background: "rgba(255,255,255,0.6)", borderRadius: "999px", padding: "4px"}}>
{v.cTabs.map((t, $index) => (<React.Fragment key={$index}>
<button onClick={t.pick} style={{height: "42px", borderRadius: "999px", border: "none", background: t.bg, color: t.fg, fontSize: "15px", fontWeight: "600"}}>{t.label}</button>
</React.Fragment>))}
</div>
</div>
<div className="tab-screen-content circles-content">
{v.showCircleList && (<>
<div style={{display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.7)", borderRadius: "24px", padding: "12px 14px"}}>
<Mo mood="happy" size={52} />
<span style={{fontSize: "16px", lineHeight: "1.4"}}>{v.circlesMoLine}</span>
</div>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.filterOpts.map((fo, $index) => (<React.Fragment key={$index}>
<button onClick={fo.pick} aria-pressed={fo.on} style={{minHeight: "42px", borderRadius: "999px", border: "none", background: fo.bg, color: fo.fg, padding: "8px 16px", fontSize: "15px"}}>{fo.label}</button>
</React.Fragment>))}
</div>
{v.circleCards.map((c, $index) => (<React.Fragment key={$index}>
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "24px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 10px 28px rgba(120,100,170,0.10)"}}>
<div style={{background: c.tint, padding: "14px 16px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px"}}>
<div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", width: "100%"}}>
<div style={{display: "flex", alignItems: "center", gap: "10px", minWidth: "0"}}><CircleGlyph kind={c.key} tint="rgba(255,255,255,.65)" /><span style={{fontSize: "20px", fontWeight: "600"}}>{c.name}</span></div>
<div className="avatar-stack">{c.avatars.slice(0,3).map((name, i) => <PersonAvatar key={name} name={name} size={28} tint={i === 0 ? "#F9DCE4" : i === 1 ? "#E3E0F8" : "#DDF1E6"} />)}</div>
</div>
<span className="meta-pill">{c.here} here now · usually quiet</span>
</div>
<div style={{padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: "10px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", letterSpacing: "1px"}}>TONIGHT'S TOPIC</span>
<span style={{fontSize: "19px", fontWeight: "600"}}>{c.topic}</span>
<div style={{display: "flex", gap: "8px"}}>
<button onClick={c.open} style={{flex: "1", height: "46px", borderRadius: "16px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "500"}}>Join {c.name} chat</button>
<button onClick={c.read} style={{flex: "1", height: "46px", borderRadius: "16px", border: "none", background: "var(--soft)", color: "var(--ink)", fontSize: "16px", fontWeight: "500"}}>Just read</button>
</div>
</div>
</div>
</React.Fragment>))}
</>)}
{v.showDmList && (<>
<span style={{fontSize: "14px", color: "var(--muted)", padding: "0 4px"}}>You can message people you've met in circles.</span>
{v.dmList.map((d, $index) => (<React.Fragment key={$index}>
<button onClick={d.open} style={{textAlign: "left", display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "24px", padding: "12px 14px", color: "var(--ink)", boxShadow: "0 10px 26px rgba(120,100,170,0.10)"}}>
<span style={{flex: "0 0 auto", width: "48px", height: "48px", borderRadius: "50%", background: d.tint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "19px", fontWeight: "600"}}>{d.initial}</span>
<span style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px"}}>
<span style={{display: "flex", justifyContent: "space-between", gap: "8px"}}><span style={{fontSize: "17px", fontWeight: "600"}}>{d.name}</span><span style={{fontSize: "14px", color: "var(--muted)"}}>{d.from}</span></span>
<span style={{fontSize: "14px", color: "var(--muted)", fontWeight: d.weight, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{d.preview}</span>
</span>
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
<span style={{fontSize: "14px", color: "#3E6B57", padding: "0 4px"}}>{v.reqDoneText}</span>
</>)}
</>)}
</div>
</div>
</>)}

{v.isCircle && (<>
<div style={{display: "flex", flexDirection: "column", minHeight: "100%"}}>
<div style={{padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: "10px"}}>
<div className="sticky-header inner-header" style={{display: "flex", alignItems: "center", gap: "12px"}}>
<button onClick={v.goCircles} aria-label="Back to circles" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<div style={{display: "flex", flexDirection: "column", flex: "1"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>{v.cName} circle</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>{v.cTopic}</span>
</div>
<button onClick={v.toggleMenu} aria-label="Safety options" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z"></path></svg>
</button>
</div>
{v.menuOpen && (<>
<div style={{display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px"}}>
<button onClick={v.doReport} style={{height: "46px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.85)", color: "var(--ink)", fontSize: "15px", fontWeight: "500"}}>Report chat</button>
<button onClick={v.doBlock} style={{height: "46px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.85)", color: "var(--ink)", fontSize: "15px", fontWeight: "500"}}>Block member</button>
</div>
</>)}
{v.hasSafetyNote && (<>
<span style={{fontSize: "14px", textAlign: "center", color: "#3E6B57"}}>{v.safetyNote}</span>
</>)}
<div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
{v.hasEvToast && (<>
<div className="rise" style={{display: "flex", gap: "10px", alignItems: "center", background: "#E4F1F0", borderRadius: "20px", padding: "10px 14px"}}>
<Mo mood="happy" size={36} />
<span style={{fontSize: "14px", lineHeight: "1.4", color: "#2F5A47"}}>{v.evToast}</span>
</div>
</>)}
{v.circleEvents.map((ev, $index) => (<React.Fragment key={$index}>
<div className="event-row-card"><DateTile day={ev.day} date={ev.date}/><button onClick={ev.open} className="event-copy" style={{border:0,background:"transparent",textAlign:"left",padding:0,color:"var(--ink)"}}><strong>{ev.title}</strong><span>{ev.when}</span><span>{ev.where}</span><span className="meta-pill">{ev.meta}</span></button>{ev.notMine ? <button onClick={ev.toggle} style={{height:"38px",border:0,borderRadius:"13px",background:ev.inBg,color:ev.inFg,padding:"0 9px",fontWeight:"600"}}>{ev.inLabel}</button> : <span style={{fontSize:"14px",color:"var(--muted)"}}>Hosting</span>}</div>
</React.Fragment>))}
<button onClick={v.newEventCircle} style={{alignSelf: "flex-start", height: "38px", borderRadius: "999px", border: "1.5px dashed #B9B1C8", background: "transparent", color: "var(--ink)", padding: "0 14px", fontSize: "14px", fontWeight: "500"}}>+ Plan an event in {v.cName}</button>
</div>
</div>

<div style={{flex: "1", padding: "12px 20px 16px", display: "flex", flexDirection: "column", gap: "14px"}}>
<div className="today-divider">Today</div>
<div className="chat-group">
<PersonAvatar name={v.m1Name} size={28} tint="#F9DCE4" onClick={v.m1CanDm ? v.m1Dm : null} />
<div><span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.m1Name}</span><div style={{background: "rgba(255,255,255,0.8)", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "82%", fontSize: "17px", lineHeight: "1.45"}}>{v.m1Text}</div><div className="chat-meta">7:38 PM</div></div>
</div>
<div className="chat-group">
<PersonAvatar name={v.m2Name} size={28} tint="#E3E0F8" onClick={v.m2CanDm ? v.m2Dm : null} />
<div><span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.m2Name}</span><div style={{background: "rgba(255,255,255,0.8)", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "82%", fontSize: "17px", lineHeight: "1.45"}}>{v.m2Text}</div><div className="chat-meta">7:42 PM</div></div>
</div>
{v.hasUnsafe && (<>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<div className="chat-group"><PersonAvatar name={v.m3Name} size={28} tint="#FBE1D8" /><div><span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.m3Name} · new member</span><div style={{background: "rgba(255,255,255,0.8)", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "82%", fontSize: "17px", lineHeight: "1.45"}}>{v.m3Text}</div><div className="chat-meta">7:43 PM</div></div>
</div>
{v.showUnsafeCard && (<>
<div className="rise" style={{background: "#FBEDEA", borderRadius: "24px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px"}}>
<div style={{display: "flex", gap: "12px", alignItems: "center"}}>
<Mo mood="worried" size={52} />
<span style={{fontSize: "16px", lineHeight: "1.4"}}>Only you can see this. {v.m3Name} is asking for money and to keep it secret. That's not safe.</span>
</div>
<div style={{display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px"}}>
<button onClick={v.unsafeReport} style={{height: "46px", borderRadius: "16px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "15px", fontWeight: "500"}}>Report Alex</button>
<button onClick={v.unsafeBlock} style={{height: "46px", borderRadius: "16px", border: "none", background: "#FFFFFF", color: "var(--ink)", fontSize: "15px", fontWeight: "500"}}>Block Alex</button>
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
<div className="chat-group"><PersonAvatar name={v.m2Name} size={28} tint="#E3E0F8" /><div><span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.m2Name}</span><div style={{background: "rgba(255,255,255,0.8)", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "82%", fontSize: "17px", lineHeight: "1.45"}}>{v.jordanReply}</div><div className="chat-meta">7:45 PM</div></div></div>
</div>
<div className="rise" style={{background: "rgba(255,255,255,0.9)", borderRadius: "24px", padding: "16px", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 16px 40px rgba(120,100,170,0.18)"}}>
<div style={{flex: "0 0 auto"}}><Mo mood={v.resultMood} size={64} /></div>
<div style={{display: "flex", flexDirection: "column", gap: "10px", flex: "1"}}>
<p style={{margin: "0", fontSize: "16px", lineHeight: "1.4"}}>{v.resultLine}</p>
<button onClick={v.resultAction} style={{height: "46px", borderRadius: "16px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "500"}}>{v.resultButton}</button>
</div>
</div>
</div>
</>)}

{v.isReadOnly && (<>
<div style={{marginTop: "auto", background: "rgba(255,255,255,0.6)", borderRadius: "24px", padding: "14px", display: "flex", alignItems: "center", gap: "12px"}}>
<Mo mood="calm" size={44} />
<span style={{flex: "1", fontSize: "15px", lineHeight: "1.4"}}>Reading quietly counts. Say hi only if you want to.</span>
<button onClick={v.stopReading} style={{height: "44px", borderRadius: "16px", border: "none", background: "var(--ink)", color: "#FFFFFF", padding: "0 14px", fontSize: "15px", fontWeight: "500"}}>Say hi</button>
</div>
</>)}

{v.showSuggest && (<>
<div style={{marginTop: "auto", background: "rgba(255,255,255,0.6)", borderRadius: "24px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px"}}>
<div style={{display: "flex", alignItems: "center", gap: "10px"}}>
<Mo mood="happy" size={40} />
<span style={{fontSize: "16px", fontWeight: "500"}}>Want a reply idea?</span>
</div>
<div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
<button onClick={v.chipAsk} style={{minHeight: "44px", borderRadius: "999px", border: "none", background: "#FFFFFF", padding: "8px 16px", fontSize: "15px", color: "var(--ink)"}}>Ask {v.m2Name} a question</button>
<button onClick={v.chipShare} style={{minHeight: "44px", borderRadius: "999px", border: "none", background: "#FFFFFF", padding: "8px 16px", fontSize: "15px", color: "var(--ink)"}}>Share my own</button>
{v.isGaming && (<>
<button onClick={v.chipOwn} style={{minHeight: "44px", borderRadius: "999px", border: "none", background: "var(--soft)", padding: "8px 16px", fontSize: "15px", color: "var(--ink)"}}>Write my own</button>
</>)}
</div>
</div>
</>)}
</div>

{v.showComposer && (<>
<div style={{padding: "10px 20px 18px", display: "flex", flexDirection: "column", gap: "8px"}}>
{v.hasDraft && (<>
<span style={{alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px", background: v.toneBg, borderRadius: "999px", padding: "6px 14px", fontSize: "14px", color: "var(--ink)"}}><span style={{width: "8px", height: "8px", borderRadius: "50%", background: v.toneDot, display: "inline-block"}}></span>{v.toneLabel}</span>
{v.hasToneWhy && (<><span className="why-line">{v.toneWhy}</span></>)}
</>)}
<div style={{display: "flex", gap: "10px", alignItems: "center"}}>
<div style={{flex: "1", minHeight: "52px", borderRadius: "24px", background: "rgba(255,255,255,0.85)", boxShadow: v.draftRing, padding: "12px 18px", display: "flex", alignItems: "center", fontSize: "16px", color: v.draftColor, lineHeight: "1.35"}}>{v.draftShown}</div>
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
<button onClick={v.evPrev} aria-label="Back" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
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
{v.showCalendar && <div style={{background:"rgba(255,255,255,.82)",borderRadius:"20px",padding:"14px"}}><strong>June 2025</strong><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"5px",marginTop:"10px"}}>{[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(n=><button key={n} onClick={v.toggleCalendar} style={{height:"34px",border:0,borderRadius:"10px",background:n===9?"var(--ink)":"transparent",color:n===9?"#fff":"var(--ink)"}}>{n}</button>)}</div></div>}
<span style={{fontSize:"14px",fontWeight:"600"}}>Start time</span>
<div className="horizontal-scroll">{v.timeOpts.map((o,i)=><button key={i} className={"choice-pill "+(o.on?"on":"")} onClick={o.pick}>{o.label}</button>)}</div>
<div className="segmented-row"><span>Duration</span><div className="segments">{v.durationOpts.map((o,i)=><button key={i} className={o.on?"on":""} onClick={o.pick}>{o.label}</button>)}</div></div>
<div style={{background:"rgba(255,255,255,.65)",borderRadius:"16px",padding:"12px",fontWeight:"600"}}>{v.evTimeRange}</div>
<div style={{display:"flex",gap:"10px",alignItems:"center",background:"var(--soft)",borderRadius:"18px",padding:"12px"}}><Mo mood="happy" size={38}/><span>Shorter is easier the first time.</span></div>
</>}
{v.evStep === 2 && <>
<span className="field-label">Where & vibe</span>
<div className="segments">{v.modeOpts.map((o,i)=><button key={i} className={o.on?"on":""} onClick={o.pick}>{o.label}</button>)}</div>
{v.evInPerson ? <>
<input className="event-input" placeholder="Search a place" aria-label="Search a place" />
{v.venueOpts.map((venue,i)=><button key={i} className={"venue-card "+(venue.on?"on":"")} onClick={venue.pick}><MapThumb/><span><strong>{venue.name}</strong><small>{venue.address} · {venue.distance}</small><small className="quiet-tag">{venue.quiet}</small></span></button>)}
</> : <>
<div className="horizontal-scroll">{v.onlineOpts.map((o,i)=><button key={i} className={"choice-pill "+(o.on?"on":"")} onClick={o.pick}>{o.label}</button>)}</div>
<div style={{background:"var(--soft)",borderRadius:"16px",padding:"12px"}}>Bridge creates the link.</div>
</>}
<div className="segmented-row"><span>Sound</span><div className="segments">{v.soundOpts.map((o,i)=><button key={i} className={o.on?"on":""} onClick={o.pick}>{o.label.replace(' music','')}</button>)}</div></div>
<div className="segmented-row"><span>Lighting</span><div className="segments">{v.lightOpts.map((o,i)=><button key={i} className={o.on?"on":""} onClick={o.pick}>{o.label}</button>)}</div></div>
{v.evInCircle && <div className="segmented-row"><span>Group size</span><div className="stepper"><button onClick={v.groupDown}>−</button><strong>{v.evGroupSize}</strong><button onClick={v.groupUp}>+</button></div></div>}
</>}
{v.evStep === 3 && <>
<span className="field-label">Who & review</span>
{v.evIsOutside ? <>{v.inviteOpts.map((o,i)=><div className="invite-row" key={i}><PersonAvatar name={o.label} size={40} tint={i%2?"#E3E0F8":"#F9DCE4"}/><span>{o.label}</span><button className={"check-box "+(o.on?"on":"")} onClick={o.pick}>{o.on?"✓":""}</button></div>)}</> : <div style={{background:"var(--soft)",borderRadius:"18px",padding:"14px"}}>Everyone in the circle can see this event.</div>}
<span style={{fontSize:"14px",fontWeight:"600"}}>Remind me</span>
<div className="segments">{v.remindOpts.map((o,i)=><button key={i} className={o.on?"on":""} onClick={o.pick}>{o.label}</button>)}</div>
{v.evInPerson && <button className={"choice-pill "+(v.shareLabel.indexOf('✓')>=0?"on":"")} onClick={v.toggleShare}>{v.shareLabel}</button>}
<span style={{fontSize:"14px",color:"var(--muted)",letterSpacing:"1px"}}>PREVIEW</span>
<div className="event-row-card"><DateTile day={v.weekDays.filter(d=>d.on)[0].day} date={v.weekDays.filter(d=>d.on)[0].date}/><div className="event-copy"><strong>{v.evPreview.split(' · ')[0]}</strong><span>{v.evTimeRange}</span><span>{v.evPreviewWhere}</span><span className="meta-pill">1 hr · 3 people</span></div></div>
</>}
</div>
<div className="sticky-cta"><button onClick={v.evStep === 3 ? v.createEvent : v.evNext}>{v.evStep === 3 ? 'Create event' : 'Next'}</button></div>
</>)}

{v.isDm && (<>
<div style={{display: "flex", flexDirection: "column", minHeight: "100%"}}>
<div className="sticky-header inner-header" style={{padding: "20px 20px 8px", display: "flex", alignItems: "center", gap: "12px"}}>
<button onClick={v.dmBack} aria-label="Back to messages" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
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
<div style={{marginTop: "auto", background: "rgba(255,255,255,0.6)", borderRadius: "24px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px"}}>
<div style={{display: "flex", alignItems: "center", gap: "8px"}}><Mo mood="happy" size={34} /><span style={{fontSize: "15px", fontWeight: "500"}}>Reply ideas</span></div>
<div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
{v.dmIdeas.map((i, $index) => (<React.Fragment key={$index}>
<button onClick={i.pick} style={{minHeight: "40px", borderRadius: "999px", border: "none", background: "#FFFFFF", padding: "8px 14px", fontSize: "14px", color: "var(--ink)", textAlign: "left"}}>{i.label}</button>
</React.Fragment>))}
</div>
</div>
</div>
<div style={{padding: "6px 20px 16px", display: "flex", flexDirection: "column", gap: "8px"}}>
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
<div style={{display: "flex", gap: "10px", alignItems: "center"}}>
<input value={v.dmDraft} onChange={v.setDmDraft} onKeyDown={v.dmKey} placeholder={"Message " + v.dmName} aria-label={"Message " + v.dmName} style={{flex: "1", minWidth: "0", height: "52px", borderRadius: "24px", border: "none", background: "rgba(255,255,255,0.9)", padding: "0 18px", fontSize: "16px", fontFamily: "inherit", color: "var(--ink)", outline: "none", boxSizing: "border-box"}} />
<button onClick={v.sendDm} aria-label={"Send to " + v.dmName} style={{width: "52px", height: "52px", flex: "0 0 auto", borderRadius: "50%", border: "none", background: v.dmSendBg, display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"></path></svg>
</button>
</div>
</div>
</div>
</>)}

{v.isNotifs && (<>
<div style={{padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: "12px"}}>
<div className="sticky-header inner-header" style={{display: "flex", alignItems: "center", gap: "12px"}}>
<button onClick={v.notifBack} aria-label="Back" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<h1 style={{margin: "0", fontSize: "24px", fontWeight: "600"}}>Notifications</h1>
</div>
<div style={{display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.6)", borderRadius: "20px", padding: "12px 14px"}}>
<Mo mood="calm" size={40} />
<span style={{flex: "1", fontSize: "14px", lineHeight: "1.4"}}>{v.notifMoLine}</span>
</div>
<button onClick={v.togglePause} style={{alignSelf: "flex-start", minHeight: "42px", borderRadius: "999px", border: "none", background: v.pauseBg, color: v.pauseFg, padding: "8px 16px", fontSize: "15px"}}>{v.pauseLabel}</button>
<span style={{fontSize: "16px", fontWeight: "600", marginTop: "4px"}}>New</span>
{v.notifNew.map((n, $index) => (<React.Fragment key={$index}>
<button onClick={n.open} style={{textAlign: "left", display: "flex", gap: "12px", alignItems: "flex-start", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "20px", padding: "14px", color: "var(--ink)", boxShadow: "0 10px 26px rgba(120,100,170,0.08)"}}>
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
<button onClick={n.open} style={{textAlign: "left", display: "flex", gap: "12px", alignItems: "flex-start", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "20px", padding: "14px", color: "var(--ink)", boxShadow: "0 10px 26px rgba(120,100,170,0.08)"}}>
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
<button onClick={v.edBack} aria-label="Back" style={{width: "44px", height: "44px", flex: "0 0 auto", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<span className="header-title">Event details</span><span></span>
</div>
<div className="event-cover" style={{background:v.edTint}}><CircleGlyph kind={v.edIcon} tint="rgba(255,255,255,.65)" size={52}/><span><strong style={{display:"block",fontSize:"18px"}}>{v.edHost}</strong><small style={{color:"var(--muted)"}}>Bridge event</small></span></div>
<div className="event-hero-card">
<h1 style={{margin: "0", fontSize: "27px", fontWeight: "600", lineHeight: "1.2"}}>{v.edTitle}</h1>
<span className="meta-pill">{v.edMeta}</span>
<div className="event-fact"><DateTile day={v.edDateDay} date={v.edDateNum}/><div><strong>{v.edTimeRange}</strong><small>{v.edWhen}</small></div></div>
{v.edInPerson ? <div className="venue-detail"><div><strong>{v.edVenue}</strong><span style={{fontSize:"14px",color:"var(--muted)"}}>{v.edAddress}</span></div><MapThumb/><div className="venue-actions"><button onClick={v.edDirections}>Directions</button><button onClick={v.edCopyAddress}>Copy address</button></div></div> : <div style={{background:"var(--soft)",borderRadius:"18px",padding:"14px"}}>Join link available 10 min before.</div>}
<div style={{display:"flex",justifyContent:"space-between",gap:"8px",fontSize:"14px"}}><span>{v.edHostedBy}</span><span>{v.edSpots}</span></div>
<div className="utility-buttons"><button onClick={v.edAddCalendar}>Add to calendar</button><button onClick={v.edShare}>Share</button></div>
</div>

<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "24px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 12px 30px rgba(120,100,170,0.10)"}}>
<span style={{fontSize: "17px", fontWeight: "600"}}>What to expect</span>
<div style={{display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px"}}>
{v.edSense.map((x, $index) => (<React.Fragment key={$index}>
<div style={{background: "var(--soft)", borderRadius: "18px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={x.path}></path></svg>
<span style={{fontSize: "14px", color: "var(--muted)"}}>{x.label}</span>
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
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "24px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 12px 30px rgba(120,100,170,0.10)"}}>
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
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "24px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 12px 30px rgba(120,100,170,0.10)"}}>
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
<span style={{fontSize: "15px", lineHeight: "1.4", color: "#2F5A47"}}>{v.edReflMo}</span>
<span style={{fontSize: "14px", lineHeight: "1.4", color: "#2F5A47"}}>{v.edReflWins}</span>
<span style={{fontSize: "14px", fontWeight: "600", color: "#2F5A47"}}>+1 brave step</span>
</span>
</div>
</>)}

{v.edPast && (<>
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "24px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 12px 30px rgba(120,100,170,0.10)"}}>
<span style={{fontSize: "17px", fontWeight: "600"}}>Stay in touch</span>
<span style={{fontSize: "14px", color: "var(--muted)", marginTop: "-6px"}}>People you met at this event</span>
{v.edConnect.map((c, $index) => (<React.Fragment key={$index}>
<div style={{display: "flex", alignItems: "center", gap: "12px"}}>
<span style={{flex: "0 0 auto", width: "40px", height: "40px", borderRadius: "50%", background: "var(--soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "600"}}>{c.initial}</span>
<span style={{flex: "1", fontSize: "16px", fontWeight: "500"}}>{c.name}</span>
{c.canDm && (<><button onClick={c.msg} style={{height: "40px", borderRadius: "14px", border: "none", background: "var(--ink)", color: "#FFFFFF", padding: "0 14px", fontSize: "14px", fontWeight: "500"}}>Message {c.name}</button></>)}
{c.noDm && (<>
{c.notSent && (<><button onClick={c.hi} style={{height: "40px", borderRadius: "14px", border: "none", background: "var(--soft)", color: "var(--ink)", padding: "0 14px", fontSize: "14px", fontWeight: "500"}}>Say hi</button></>)}
{c.sent && (<><span style={{fontSize: "14px", color: "#3E6B57"}}>Request sent ✓</span></>)}
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
<div style={{width: "100%", minHeight: "100%", boxSizing: "border-box", padding: "26px 20px 30px", display: "flex", flexDirection: "column", background: "var(--bg)"}}>
<button onClick={v.goCircle} aria-label="Back to chat" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<div style={{flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "18px"}}>
<div className="rise" style={{background: "rgba(255,255,255,0.85)", borderRadius: "24px", padding: "26px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center", boxShadow: "0 24px 60px rgba(120,100,170,0.2)"}}>
<div><Mo mood="worried" size={120} /></div>
<span style={{fontSize: "27px", fontWeight: "600", lineHeight: "1.2"}}>Let's take a breath together</span>
<span style={{fontSize: "17px", lineHeight: "1.45", color: "var(--muted)"}}>This might hurt Jordan's feelings. You can still send it. You decide.</span>
<div style={{width: "100%", background: "#FBEDEA", borderRadius: "20px", padding: "14px 16px", textAlign: "left", fontSize: "16px", lineHeight: "1.4"}}>"Zelda?? Seriously, that's the most overrated answer ever."</div>
<div className="why-box"><strong>Why Mo noticed</strong><span>"Seriously" and "overrated" can sound like you are making fun of something Jordan loves. Other people in the circle can see it too, so Jordan might feel embarrassed.</span></div>
<div style={{display: "flex", flexDirection: "column", gap: "10px", width: "100%", marginTop: "4px"}}>
<button onClick={v.sayKindly} style={{height: "54px", borderRadius: "20px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "17px", fontWeight: "500"}}>Say it gently</button>
<button onClick={v.goReset} style={{height: "54px", borderRadius: "20px", border: "none", background: "var(--soft)", color: "var(--ink)", fontSize: "17px", fontWeight: "500"}}>Breathe with Mo</button>
<button onClick={v.sendAnyway} style={{height: "44px", border: "none", background: "transparent", color: "var(--muted)", fontSize: "16px", fontWeight:"600"}}>Send anyway</button>
</div>
</div>
</div>
</div>
</>)}

{v.isReset && (<>
<div style={{width: "100%", minHeight: "100%", boxSizing: "border-box", padding: "36px 24px 30px", display: "flex", flexDirection: "column", alignItems: "stretch", gap: "16px", textAlign: "center", background: "var(--bg)"}}>
<span style={{fontSize: "15px", color: "var(--muted)", letterSpacing: "1px"}}>ONE-MINUTE BREATHER</span>
<div style={{width: "260px", height: "260px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", alignSelf: "center"}}>
<div className="breathe" style={{position: "absolute", width: "250px", height: "250px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0) 72%)"}}></div>
<div style={{position: "relative"}}><Mo mood="calm" size={130} /></div>
</div>
<h1 style={{margin: "0", fontSize: "30px", fontWeight: "600"}}>Breathe with Mo</h1>
<p style={{margin: "0", fontSize: "17px", lineHeight: "1.5", color: "var(--muted)", maxWidth: "310px", alignSelf: "center"}}>In as the light grows. Out as it fades. Nothing needs fixing right now.</p>
<div style={{alignSelf: "center", display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.7)", borderRadius: "999px", padding: "8px 16px"}}>
<span style={{fontSize: "15px", color: "var(--muted)"}}>Breathe in 4</span>
<span style={{width: "4px", height: "4px", borderRadius: "50%", background: "#A79DBD", display: "inline-block"}}></span>
<span style={{fontSize: "15px", color: "var(--muted)"}}>Out 6</span>
<span style={{width: "4px", height: "4px", borderRadius: "50%", background: "#A79DBD", display: "inline-block"}}></span>
<span style={{fontSize: "15px", fontWeight: "600", color: "var(--ink)"}}>0:48 left</span>
</div>
<div style={{width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto"}}>
<button onClick={v.readyAfterReset} style={{height: "54px", borderRadius: "20px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "17px", fontWeight: "500"}}>I'm ready</button>
<button onClick={v.textTrusted} style={{height: "54px", borderRadius: "20px", border: "none", background: "rgba(255,255,255,0.8)", color: "var(--ink)", fontSize: "17px", fontWeight: "500"}}>Text someone I trust</button>
{v.trustSent && (<>
<span className="rise" style={{fontSize: "15px", color: "#3E6B57"}}>Sent to {v.trusted}: "Can you call me when you're free?"</span>
</>)}
</div>
</div>
</>)}

{v.isPractice && (<>
<div style={{padding: "28px 20px 110px", display: "flex", flexDirection: "column", gap: "16px"}}>
<div className="sticky-header inner-header">
<button onClick={v.goHome} aria-label="Back to Home" style={{width:"44px",height:"44px",border:0,borderRadius:"16px",background:"rgba(255,255,255,.7)",display:"grid",placeItems:"center"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke:"var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 6-6 6 6 6"/></svg></button>
<h1 className="header-title">Practice</h1>
<span style={{background: "rgba(255,255,255,0.75)", borderRadius: "999px", padding: "6px 10px", fontSize: "14px", textAlign: "center", whiteSpace: "nowrap", justifySelf: "end"}}>{v.levelLabel.split(' · ')[0]}</span>
</div>
{v.pPicking && (<>
<div style={{display: "flex", flexDirection: "column", gap: "14px"}}>
<div style={{background: "rgba(255,255,255,0.82)", borderRadius: "24px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px"}}>
<Mo mood="happy" size={56} />
<span style={{fontSize: "17px", lineHeight: "1.4"}}>Pick something to practice. It's just between us.</span>
</div>
<span style={{fontSize: "16px", fontWeight: "600"}}>Made for you today</span>
{v.recScenarios.map((sc, $index) => (<React.Fragment key={$index}>
<button onClick={sc.pick} style={{textAlign: "left", minHeight: "64px", borderRadius: "20px", border: "none", background: sc.bg, color: sc.fg, padding: "10px 12px", display: "grid", gridTemplateColumns:"38px 1fr auto", alignItems:"center", gap: "10px"}}>
<span style={{width:"38px",height:"38px",borderRadius:"12px",background:sc.fg==="#FFFFFF"?"rgba(255,255,255,.15)":"var(--soft)",display:"grid",placeItems:"center"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: sc.fg}} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={sc.icon}/></svg></span>
<span style={{display:"flex",flexDirection:"column"}}><span style={{fontSize: "16px", fontWeight: "600"}}>{sc.title}</span><span style={{fontSize: "14px"}}>{sc.group}</span></span><span className="meta-pill">2 min</span>
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
<div style={{background: "rgba(255,255,255,0.82)", borderRadius: "24px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px"}}>
<Mo mood="happy" size={56} />
<div style={{display: "flex", flexDirection: "column"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>{v.pTitle}</span>
<span style={{fontSize: "15px", color: "var(--muted)"}}>{v.pScene} Mo plays {v.pPartner}.</span>
</div>
</div>
<div style={{display: "flex", flexDirection: "column", gap: "12px", minHeight: "220px"}}>
<div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.pPartner} (practice)</span>
<div style={{alignSelf: "flex-start", background: "rgba(255,255,255,0.8)", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "80%", fontSize: "17px", lineHeight: "1.45"}}>{v.pOpener}</div>
</div>
{v.pChosen && (<>
<div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
<div className="rise" style={{alignSelf: "flex-end", background: "var(--ink)", color: "#FFFFFF", borderRadius: "24px 24px 8px 24px", padding: "13px 17px", maxWidth: "80%", fontSize: "17px", lineHeight: "1.45"}}>{v.pText}</div>
<div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.pPartner} (practice)</span>
<div className="rise" style={{alignSelf: "flex-start", background: "rgba(255,255,255,0.8)", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "80%", fontSize: "17px", lineHeight: "1.45"}}>{v.pReply}</div>
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
<button onClick={v.askHint} style={{alignSelf: "flex-start", minHeight: "40px", borderRadius: "999px", border: "1.5px dashed #B9B1C8", background: "transparent", color: "var(--ink)", padding: "6px 14px", fontSize: "14px", fontWeight: "500"}}>Need a hint? (1 left)</button>
</>)}
<span style={{fontSize: "14px", color: "var(--muted)", padding: "0 4px"}}>Pick a reply</span>
{v.pChoiceGoodFirst && (<><button onClick={v.pickGood} style={{textAlign: "left", minHeight: "56px", borderRadius: "20px", border: "none", background: "rgba(255,255,255,0.85)", padding: "12px 16px", fontSize: "16px", lineHeight: "1.4", color: "var(--ink)"}}>"{v.pGoodText}"</button>
<button onClick={v.pickVague} style={{textAlign: "left", minHeight: "56px", borderRadius: "20px", border: "none", background: "rgba(255,255,255,0.85)", padding: "12px 16px", fontSize: "16px", lineHeight: "1.4", color: "var(--ink)"}}>"{v.pVagueText}"</button></>)}
{v.pChoiceVagueFirst && (<><button onClick={v.pickVague} style={{textAlign: "left", minHeight: "56px", borderRadius: "20px", border: "none", background: "rgba(255,255,255,0.85)", padding: "12px 16px", fontSize: "16px", lineHeight: "1.4", color: "var(--ink)"}}>"{v.pVagueText}"</button>
<button onClick={v.pickGood} style={{textAlign: "left", minHeight: "56px", borderRadius: "20px", border: "none", background: "rgba(255,255,255,0.85)", padding: "12px 16px", fontSize: "16px", lineHeight: "1.4", color: "var(--ink)"}}>"{v.pGoodText}"</button></>)}
</div>
</>)}
{v.pShowType && (<>
<div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", padding: "0 4px"}}>No hints this time. Reply like you would in a real chat.</span>
{v.typedHasTone && (<>
<span style={{alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px", background: v.typedToneBg, borderRadius: "999px", padding: "6px 14px", fontSize: "14px"}}><span style={{width: "8px", height: "8px", borderRadius: "50%", background: v.typedDot, display: "inline-block"}}></span>Mo: {v.typedTone}</span>
</>)}
<div style={{display: "flex", gap: "10px", alignItems: "center"}}>
<input value={v.pTyped} onChange={v.setTyped} onKeyDown={v.typedKey} placeholder={"Reply to " + v.pPartner} aria-label={"Reply to " + v.pPartner} autoComplete="off" style={{flex: "1", minWidth: "0", height: "52px", borderRadius: "24px", border: "none", background: "rgba(255,255,255,0.9)", padding: "0 18px", fontSize: "16px", fontFamily: "inherit", color: "var(--ink)", outline: "none", boxSizing: "border-box"}} />
<button onClick={v.sendTyped} aria-label="Send reply" style={{width: "52px", height: "52px", flex: "0 0 auto", borderRadius: "50%", border: "none", background: v.typedSendBg, display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"></path></svg>
</button>
</div>
</div>
</>)}
</div>
</>)}
{v.pPicking && <div className="sticky-cta"><button onClick={v.startPractice}>Start practice</button></div>}
{v.pChosen && <div className="sticky-cta"><button onClick={v.goFeedback}>See how I did</button></div>}
</div>
</>)}

{v.isFeedback && (<>
<div style={{padding: "34px 20px 110px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center"}}>
<div><Mo mood="happy" size={120} /></div>
<h1 style={{margin: "0", fontSize: "32px", fontWeight: "600"}}>{v.fbTitle}</h1>
<div style={{width: "100%", background: "rgba(255,255,255,0.85)", borderRadius: "24px", padding: "18px", textAlign: "left", display: "flex", flexDirection: "column", gap: "4px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", letterSpacing: "1px"}}>WHAT WENT WELL</span>
<span style={{fontSize: "17px", lineHeight: "1.45"}}>{v.fbStar}</span>
</div>
<div style={{width: "100%", background: "var(--soft)", borderRadius: "24px", padding: "18px", textAlign: "left", display: "flex", flexDirection: "column", gap: "4px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", letterSpacing: "1px"}}>ONE THING TO TRY</span>
<span style={{fontSize: "17px", lineHeight: "1.45"}}>{v.fbSpark}</span>
</div>
{v.fbIsOwn && (<>
<div style={{width: "100%", background: "rgba(255,255,255,0.6)", borderRadius: "24px", padding: "18px", textAlign: "left", display: "flex", flexDirection: "column", gap: "4px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", letterSpacing: "1px"}}>ANOTHER WAY TO SAY IT</span>
<span style={{fontSize: "17px", lineHeight: "1.45"}}>"{v.fbExample}"</span>
</div>
</>)}
<div style={{width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px"}}>
<button onClick={v.goPractice} style={{height: "54px", borderRadius: "20px", border: "none", background: "rgba(255,255,255,0.8)", color: "var(--ink)", fontSize: "17px", fontWeight: "500"}}>Practice again</button>
</div>
</div>
<div className="sticky-cta"><button onClick={v.goGaming}>Try it for real</button></div>
</>)}

{v.isWin && (<>
<div style={{width: "100%", minHeight: "100%", boxSizing: "border-box", padding: "50px 20px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", textAlign: "center", background: "var(--bg)"}}>
<span style={{fontSize: "15px", color: "var(--muted)", letterSpacing: "1px"}}>BRAVE STEP EARNED</span>
<div className="rise" style={{width: "190px", height: "190px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", boxShadow: "0 24px 60px rgba(120,100,170,0.22)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px"}}>
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
<button onClick={v.finishWin} style={{width: "100%", height: "54px", borderRadius: "20px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "17px", fontWeight: "500", marginTop: "auto"}}>Add to my collection</button>
</div>
</>)}

{v.isMe && (<>
<div className="tab-screen">
<div className="tab-sticky-header me-identity-header">
<div style={{position: "relative", flex: "0 0 auto"}}>
{v.hasPhoto ? <img src={v.pPhoto} alt="Your profile photo" className="me-avatar" /> : <span className="me-avatar me-initials">{v.initials}</span>}
<label aria-label="Change profile photo" className="camera-button"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg><input type="file" accept="image/*" onChange={v.pickPhoto} style={{display:"none"}} /></label>
</div>
<div className="me-identity-copy"><h1>{v.fullName}</h1><span>{v.interestNames}</span><span className="meta-pill">{v.steps} brave steps this week</span></div>
</div>
<div className="tab-screen-content me-content">
<button onClick={v.openJourney} className="calm-card journey-preview" aria-label="Open My journey">
<div className="journey-mini-bars">{v.journey.map((w,$i)=><span key={$i}><i style={{height:w.h,background:w.bg}}></i></span>)}</div>
<div className="journey-preview-copy"><strong>My journey</strong><span>4 weeks · 3 badges</span><div className="badge-row"><BadgeMark kind="hello"/><BadgeMark kind="kind"/><BadgeMark kind="pause"/></div></div><span className="row-chevron">›</span>
</button>
{v.reqPending && <div className="calm-card coach-request"><div><Mo mood="happy" size={46}/><strong>Coach Maria wants to connect</strong></div><p>She won't see anything unless you choose.</p><div><button onClick={v.reqAccept}>Review request</button><button onClick={v.reqDecline}>Not now</button></div></div>}
<section><h2 className="section-title">My people</h2><div className="me-list-card">
<button className="me-list-row" onClick={v.openTrusted}><PersonAvatar name={v.trusted} size={40} tint="var(--soft)"/><span><strong>{v.trusted}</strong><small>{v.trustedRel} · Gets help texts</small></span><b>›</b></button>
{v.showCoachPerson && <button className="me-list-row" onClick={v.openCoach}><PersonAvatar name="Coach Maria" size={40} tint="#DDF1E6"/><span><strong>Coach Maria</strong><small>{v.reqChoose ? 'Choose what she sees' : v.mariaSees}</small></span><b>›</b></button>}
</div></section>
<section><h2 className="section-title">Settings</h2><div className="me-list-card">
{v.meSettings.map((item,$i)=><button className="me-list-row settings-row" onClick={item.open} key={$i}><span className="setting-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke:"var(--ink)"}} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={item.path}/></svg></span><span><strong>{item.label}</strong></span>{item.swatch && <i className="setting-swatch" style={{background:item.swatch}}></i>}<small>{item.value}</small><b>›</b></button>)}
</div></section>
<div className="me-footer-card">Mo isn't a therapist. Need help now? <strong>Call 988.</strong></div>
</div></div>
</>)}

{v.isMeJourney && <><MeSubHeader title="My journey" onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card"><div className="journey-bars">{v.journey.map((w,$i)=><div className="journey-col" key={$i}><strong>{w.value}</strong><i style={{height:w.h,background:w.bg}}></i><small>{w.label}</small></div>)}</div><span className="muted-copy">Brave steps per week</span><div className="journey-stats"><div><strong>6</strong><small>practices</small></div><div><strong>2</strong><small>events joined</small></div><div><strong>Level 2</strong><small>reached</small></div></div><h2 className="section-title">Badges</h2><div className="badge-grid"><div><BadgeMark kind="hello" size={52}/><strong>First Hello</strong><small>Said hi</small></div><div><BadgeMark kind="kind" size={52}/><strong>Kind Words</strong><small>Disagreed gently</small></div><div><BadgeMark kind="pause" size={52}/><strong>Breather</strong><small>Took a pause</small></div><div><BadgeMark kind="event" size={52}/><strong>Game Night</strong><small>Go to one event</small></div></div></div></div></>}

{v.isMeTrusted && <><MeSubHeader title={v.trusted} onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card person-detail"><PersonAvatar name={v.trusted} size={56} tint="var(--soft)"/><h2>{v.trusted}</h2><span className="muted-copy">{v.trustedRel} · {v.trustedContact}</span><h3>What they can see</h3><div className="pill-group"><button className="choice-pill on">I need help texts</button></div><p className="muted-copy">Your chats, check-ins and pauses stay private.</p></div></div></>}

{v.isMeCoach && <><MeSubHeader title="Coach Maria" onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card person-detail"><PersonAvatar name="Coach Maria" size={56} tint="#DDF1E6"/><h2>Coach Maria</h2><span className="muted-copy">First Place coach</span><h3>What she can see</h3><div className="pill-group"><button onClick={v.toggleSeeSteps} aria-pressed={v.seeSteps} className={v.seeSteps ? 'choice-pill on' : 'choice-pill'}>My brave steps</button><button onClick={v.toggleSeeHelp} aria-pressed={v.seeHelp} className={v.seeHelp ? 'choice-pill on' : 'choice-pill'}>I need help texts</button></div><p className="muted-copy">Your chats, check-ins and pauses stay private.</p>{v.reqChoose && <button className="primary-action" onClick={v.reqConnect}>Connect with Coach Maria</button>}</div></div></>}

{v.isMeProfile && <><MeSubHeader title="Profile" onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card"><div className="sub-card-title"><h2>My profile</h2>{v.profView && <button onClick={v.editProfile}>Edit</button>}</div><div className="profile-photo-row">{v.hasPhoto ? <img src={v.pPhoto} alt="Your profile photo"/> : <span>{v.initials}</span>}<label>Change photo<input type="file" accept="image/*" onChange={v.pickPhoto}/></label></div>{v.profView ? <div className="profile-values"><div><span>First name</span><strong>{v.pFirst}</strong></div><div><span>Last name</span><strong>{v.pLast}</strong></div><div><span>Gender</span><strong>{v.pGender}</strong></div><div><span>Email</span><strong>{v.pEmail}</strong></div></div> : <div className="profile-form"><label>First name<input type="text" value={v.pFirst} onChange={v.setFirst}/></label><label>Last name<input type="text" value={v.pLast} onChange={v.setLast}/></label><span>Gender</span><div className="pill-group">{v.genderOpts.map((o,$i)=><button key={$i} onClick={o.pick} aria-pressed={o.on} className={o.on?'choice-pill on':'choice-pill'}>{o.label}</button>)}</div><label>Email<input type="email" value={v.pEmail} onChange={v.setEmail}/></label>{v.hasPhoto && <button className="quiet-action" onClick={v.removePhoto}>Remove profile photo</button>}<button className="primary-action" onClick={v.saveProfile}>Save profile</button></div>}<p className="muted-copy">In circles, people only see your first name and photo.</p></div></div></>}

{v.isMeColors && <><MeSubHeader title="Colors" onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card"><div className="theme-grid">{v.themeOpts.map((t,$i)=><button key={$i} onClick={t.pick} aria-pressed={t.on} aria-label={'Theme: '+t.name} style={{boxShadow:t.ring}}><i style={{background:t.swatch}}></i><span>{t.name}</span>{t.on&&<b>✓</b>}</button>)}</div></div></div></>}

{v.isMeComfort && <><MeSubHeader title="Comfort" onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card comfort-card"><div className="segmented-row"><span>Text size</span><div className="segments">{v.sizeSeg.map((o,$i)=><button key={$i} className={o.cls} aria-pressed={o.on} onClick={o.pick}>{o.label}</button>)}</div></div><div className="segmented-row"><span>Calm mode</span><div className="segments">{v.calmSeg.map((o,$i)=><button key={$i} className={o.cls} aria-pressed={o.on} onClick={o.pick}>{o.label}</button>)}</div></div><div className="segmented-row"><span>Chatting</span><div className="segments">{v.chatSeg.map((o,$i)=><button key={$i} className={o.cls} aria-pressed={o.on} onClick={o.pick}>{o.label}</button>)}</div></div><p className="muted-copy">Calm mode turns off moving animations. Changes save right away.</p></div></div></>}

{v.isMeInterests && <><MeSubHeader title="Interests" onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card"><div className="interest-grid">{v.interestOpts.map((o,$i)=><button key={$i} onClick={o.pick} aria-pressed={o.on} className="interest-tile" style={{boxShadow:o.ring}}><CircleGlyph kind={o.key} tint={o.tint} size={40}/><span>{o.name}</span>{o.on&&<b className="tick">✓</b>}</button>)}</div><p className="muted-copy">{v.interestCount}. Changes save right away.</p></div></div></>}

{v.isMePrivacy && <><MeSubHeader title="Privacy & safety" onBack={v.meBack}/><div className="me-sub-content"><div className="calm-card me-sub-card privacy-card"><h2>Who sees what</h2><div><strong>{v.trusted}</strong><span>Gets your I need help texts</span></div>{v.mariaConnected&&<div><strong>Coach Maria</strong><span>{v.mariaSees}</span></div>}<p className="muted-copy">Your chats, check-ins and pauses are never shared.</p><h2>Blocked people</h2><div><strong>{v.blockedSummary}</strong></div><h2>Safety rules</h2><span className="safety-row"><b>1</b>Never share your address, passwords or money.</span><span className="safety-row"><b>2</b>If someone asks for secrets or money, Mo warns you privately.</span><span className="safety-row"><b>3</b>You can leave, mute or block anyone, anytime.</span><span className="safety-row"><b>4</b>Need help now? Tap Mo, then I need help, or call 988.</span></div></div></>}

{v.hasUiToast && <div className="ui-toast" role="status" aria-live="polite">
{v.uiToast === '+1 brave step' && <Mo mood="happy" size={32} />}
<span>{v.uiToast}{v.hasUndo ? ' ·' : ''}</span>
{v.hasUndo ? <button className="toast-undo" onClick={v.undoToast}>Undo</button> : <button className="toast-dismiss" onClick={v.clearToast}>Dismiss</button>}
</div>}
</div>
</div>

{v.showTabs && (<>
{v.showMoMenu && (<>
<div className="rise" style={{position: "absolute", right: "16px", bottom: "96px", width: "260px", background: "rgba(255,255,255,0.97)", borderRadius: "24px", padding: "10px", boxSizing: "border-box", boxShadow: "0 20px 50px rgba(120,100,170,0.28)", display: "flex", flexDirection: "column", gap: "6px", zIndex: "5"}}>
<button onClick={v.moPractice} style={{textAlign: "left", minHeight: "56px", borderRadius: "18px", border: "none", background: "var(--soft)", padding: "10px 14px", color: "var(--ink)", display: "flex", flexDirection: "column", gap: "2px"}}>
<span style={{fontSize: "16px", fontWeight: "600"}}>Practice with me</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>{v.moPracticeHint}</span>
</button>
<button onClick={v.moBreathe} style={{textAlign: "left", minHeight: "56px", borderRadius: "18px", border: "none", background: "transparent", padding: "10px 14px", color: "var(--ink)", display: "flex", flexDirection: "column", gap: "2px"}}>
<span style={{fontSize: "16px", fontWeight: "600"}}>Breathe with me</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>A one-minute calm-down</span>
</button>
<button onClick={v.moHelp} style={{textAlign: "left", minHeight: "56px", borderRadius: "18px", border: "none", background: "transparent", padding: "10px 14px", color: "var(--ink)", display: "flex", flexDirection: "column", gap: "2px"}}>
<span style={{fontSize: "16px", fontWeight: "600"}}>I need help</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>Reach someone you trust, or 988</span>
</button>
</div>
</>)}
<div style={{flex: "0 0 auto", padding: "10px 0 18px", display: "flex", justifyContent: "center"}}>
<nav style={{height: "64px", background: "var(--ink)", borderRadius: "32px", display: "flex", alignItems: "center", gap: "6px", padding: "6px", boxSizing: "border-box", boxShadow: "0 12px 30px rgba(59,51,80,0.3)"}}>
<button onClick={v.goHome} aria-label="Home" style={{height: "52px", width: "96px", padding: "0", borderRadius: "24px", border: "none", background: v.homeBg, color: v.homeFg, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", fontWeight: "600"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{stroke: v.homeFg}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8"></path><path d="M5.5 9.5V21h13V9.5"></path></svg>
{v.tabIsHome && (<><span>Home</span></>)}
</button>
<button onClick={v.goCircles} aria-label="Circles" style={{height: "52px", width: "96px", padding: "0", borderRadius: "24px", border: "none", background: v.circlesBg, color: v.circlesFg, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", fontWeight: "600"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{stroke: v.circlesFg}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="9" r="3"></circle><circle cx="16" cy="9" r="3"></circle><path d="M2.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 15.3c.8-.2 1.6-.3 2.5-.3 3 0 5 1.5 5.5 5"></path></svg>
{v.tabIsCircles && (<><span>Circles</span></>)}
</button>
<button onClick={v.goMe} aria-label="Me" style={{height: "52px", width: "96px", padding: "0", borderRadius: "24px", border: "none", background: v.meBg, color: v.meFg, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", fontWeight: "600"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{stroke: v.meFg}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4.5 21c.8-4 3.3-6 7.5-6s6.7 2 7.5 6"></path></svg>
{v.tabIsMe && (<><span>Me</span></>)}
</button>
<button onClick={v.toggleMo} aria-label="Open Mo" aria-expanded={v.moOpen} style={{width: "52px", height: "52px", borderRadius: "50%", border: "none", background: v.moBtnBg, display: "flex", alignItems: "center", justifyContent: "center", padding: "0"}}>
<Mo mood={v.floatMood} size={42} />
</button>
</nav>
</div>
<div className="home-indicator" aria-hidden="true"></div>
</>)}
</div>
</>);
  }
}

export default function App() {
  return (
    <div className="stage">
      <div className="phone"><Bridge /></div>
    </div>
  );
}
