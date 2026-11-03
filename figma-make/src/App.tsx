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

class BridgeBase extends DCLogic {
  renderVals() {
    var s = this.state || {};
    var self = this;
    var screen = s.screen || 'checkin';
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
    var helpTo = s.helpTo || 'Mom';
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
    var levelNames = ['Level 1 · hints on', 'Level 2 · no hints', 'Level 3 · realistic'];
    var scenItem = function (k) {
      var on = k === pScen;
      return { title: scripts[k].title, group: scripts[k].group, bg: on ? 'var(--ink)' : 'rgba(255,255,255,0.85)', fg: on ? '#FFFFFF' : 'var(--ink)',
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
    var chip = function (opts, cur, key) {
      return Object.keys(opts).map(function (k) {
        var on = k === cur; var o = {};
        o[key] = k;
        return { label: opts[k], on: on, bg: on ? 'var(--ink)' : 'rgba(255,255,255,0.85)', fg: on ? '#FFFFFF' : 'var(--ink)',
          pick: function () { self.setState(o); } };
      });
    };
    var levelList = [['Level 1', 'hints on'], ['Level 2', 'no hints'], ['Level 3', 'realistic']].map(function (l, i) {
      var on = pLevel === i + 1;
      return { name: l[0], desc: l[1], bg: on ? 'var(--ink)' : 'rgba(255,255,255,0.85)', fg: on ? '#FFFFFF' : 'var(--ink)',
        pick: function () { self.setState({ pLevel: i + 1 }); } };
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
      return { title: e.title, when: e.when, where: e.where, tag: e.tag,
        hostLabel: c ? c.name + ' circle' : 'Outside circles · friends',
        tint: c ? c.tint : '#E4F1F0',
        goingText: (e.going + (g ? 1 : 0)) + ' going',
        isMine: !!e.mine, notMine: !e.mine,
        inLabel: g ? 'Going ✓' : "I'm in", inBg: g ? 'var(--ink)' : 'var(--soft)', inFg: g ? '#FFFFFF' : 'var(--ink)',
        toggle: function () { var r = Object.assign({}, rsvp); r[e.id] = g ? '' : 'going'; self.setState({ rsvp: r }); },
        sense: [e.size, e.sound, e.light].filter(Boolean),
        open: function () { self.setState({ screen: 'event', evId: e.id, evBackTo: screen, moOpen: false, evToast: '' }); } };
    };
    var homeEvents = events.filter(function (e) { return e.mine || rsvp[e.id] === 'going'; }).map(evCard);
    var circleEvents = events.filter(function (e) { return e.circle === cKey; }).map(evCard);
    var evFrom = s.evFrom || 'home';
    var evHost = s.evHost || 'outside';
    var evIsOutside = evHost === 'outside';
    var whatOpts = evIdeas[evHost];
    var evWhat = whatOpts.indexOf(s.evWhat) >= 0 ? s.evWhat : whatOpts[0];
    var whenOpts = ['Tonight · 7 PM', 'Sat · 2 PM', 'Sun · 11 AM'];
    var evWhen = whenOpts.indexOf(s.evWhen) >= 0 ? s.evWhen : whenOpts[1];
    var whereOpts = evIsOutside ? ['In person · café', 'In person · park', 'Online · video call'] : ['Online · voice chat', 'Online · text only', 'In person · public place'];
    var evWhere = whereOpts.indexOf(s.evWhere) >= 0 ? s.evWhere : whereOpts[0];
    var sizeOpts = ['2–4 people', '5–8 people'];
    var evSize = s.evSize || sizeOpts[0];
    var evInvite = s.evInvite || ['Jordan'];
    var evShare = s.evShare === undefined ? true : s.evShare;
    var evInPerson = evWhere.indexOf('In person') === 0;
    var soundOpts = evInPerson ? ['Quiet', 'Soft music', 'Loud music'] : ['Voice optional', 'Text only', 'Music on'];
    var evSound = soundOpts.indexOf(s.evSound) >= 0 ? s.evSound : soundOpts[0];
    var lightOpts = evInPerson ? ['Soft light', 'Bright', 'Dim'] : ['Camera off is fine', 'Cameras on'];
    var evLight = lightOpts.indexOf(s.evLight) >= 0 ? s.evLight : lightOpts[0];
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
      return function () { self.setState({ screen: 'newEvent', evFrom: from, evHost: host, evWhat: '', evWhen: '', evWhere: '', evSize: '', evSound: '', evLight: '', evInvite: ['Jordan'], evShare: true, moOpen: false, menuOpen: false, evToast: '' }); };
    };
    var createEvent = function () {
      var ne = { id: 'n' + Date.now(), circle: evIsOutside ? null : evHost, title: evWhat, when: evWhen, where: evWhere,
        tag: evIsOutside ? 'With ' + evInvite.join(', ') : (evSize === sizeOpts[0] ? 'Small group' : 'Medium group'), going: 0, mine: true,
        size: evIsOutside ? (evInvite.length + 1) + ' people' : evSize, sound: evSound, light: evLight,
        exit: evInPerson ? 'Leave anytime' : 'Leave the chat anytime', people: evIsOutside ? evInvite.slice() : [],
        prep: evInPerson ? 'leave' : 'joinin' };
      var r = Object.assign({}, rsvp); r[ne.id] = 'going';
      var toCircle = evFrom === 'circle' && !evIsOutside;
      self.setState({ events: [ne].concat(events), rsvp: r, screen: toCircle ? 'circle' : 'home', circle: evIsOutside ? cKey : evHost,
        evToast: evIsOutside ? 'Invites sent to ' + evInvite.join(', ') + '. Mo will remind you an hour before.' : 'Your event is posted in ' + circleData[evHost].name + '. Mo will remind you an hour before.' });
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
      hostOpts: hostOpts, whatOpts: pickList(whatOpts, evWhat, 'evWhat'), whenOpts: pickList(whenOpts, evWhen, 'evWhen'),
      whereOpts: pickList(whereOpts, evWhere, 'evWhere'), sizeOpts: pickList(sizeOpts, evSize, 'evSize'),
      inviteOpts: inviteOpts, evIsOutside: evIsOutside, evInCircle: !evIsOutside,
      evInPerson: evInPerson,
      soundOpts: pickList(soundOpts, evSound, 'evSound'), lightOpts: pickList(lightOpts, evLight, 'evLight'),
      shareLabel: evShare ? 'Mom will know where I am ✓' : 'Tell Mom where I will be',
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
      saveProfile: function () { self.setState({ profEdit: false }); },
      setFirst: function (e) { self.setState({ pFirst: e.target.value }); },
      setLast: function (e) { self.setState({ pLast: e.target.value }); },
      setEmail: function (e) { self.setState({ pEmail: e.target.value }); },
      pickPhoto: function (e) { var f = e.target.files && e.target.files[0]; if (f) self.setState({ pPhoto: URL.createObjectURL(f) }); },
      removePhoto: function () { self.setState({ pPhoto: '' }); },
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
    var openDm = function (k) {
      return function () { var r = Object.assign({}, dmRead); r[k] = true; self.setState({ screen: 'dm', dm: k, dmDraft: '', dmRead: r, moOpen: false, dmGentle: false }); };
    };
    var unreadCount = Object.keys(dmData).filter(function (k) { return dmData[k].unread && !dmRead[k]; }).length;
    var sendDm = function () {
      if (!dmDraft.trim()) return;
      var idx = dmd.ideas.indexOf(dmDraft); var replyText = idx >= 0 ? dmd.replies[idx] : dmd.reply;
      var list = msgsFor(dmKey).concat([['me', dmDraft]]);
      var m = Object.assign({}, dmMsgs); m[dmKey] = list;
      self.setState({ dmMsgs: m, dmDraft: '', dmGentle: false });
      setTimeout(function () {
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
      reqReport: function () { self.setState({ dmReq: 'reported' }); },
      reqDelete: function () { self.setState({ dmReq: 'deleted' }); },
      isDm: screen === 'dm',
      dmName: dmd.name, dmFrom: 'Met in the ' + dmd.from, dmTint: dmd.tint, dmInitial: dmd.name[0],
      dmMessages: msgsFor(dmKey).map(function (m) {
        var me = m[0] === 'me';
        return { text: m[1], align: me ? 'flex-end' : 'flex-start', bg: me ? 'var(--ink)' : 'rgba(255,255,255,0.85)', fg: me ? '#FFFFFF' : 'var(--ink)',
          radius: me ? '24px 24px 8px 24px' : '24px 24px 24px 8px' };
      }),
      dmIdeas: dmd.ideas.map(function (t) { return { label: t, pick: function () { self.setState({ dmDraft: t, dmGentle: false }); } }; }),
      dmDraft: dmDraft,
      setDmDraft: function (e) { self.setState({ dmDraft: e.target.value, dmGentle: false }); },
      dmKey: function (e) { if (e.key === 'Enter' && !dmHarsh) sendDm(); },
      dmHarsh: dmHarsh, dmNotHarsh: !dmHarsh,
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
      togglePause: function () { self.setState({ notifPaused: !notifPaused }); },
      notifMoLine: notifPaused ? 'Notifications are paused. I’ll still let your trusted people reach you if you need help.' : 'I bundle notifications so they don’t pile up. Tap one to go there.'
    };

    // ---------- Themes ----------
    var themes = {
      dawn: { name: 'Dawn', desc: 'Soft peach and lilac', swatch: 'linear-gradient(135deg, #F7CFC6, #B9A6E3)', bg: 'linear-gradient(170deg, #FBE6DD 0%, #F1E4F3 45%, #DFE3FA 100%)', ink: '#3B3350', soft: '#EFE6F8', muted: '#6E6585' },
      sage: { name: 'Sage', desc: 'Quiet greens', swatch: 'linear-gradient(135deg, #CFE5D2, #5E8B74)', bg: 'linear-gradient(170deg, #EAF2E6 0%, #E5EFE8 50%, #DDEBEC 100%)', ink: '#2F4A3F', soft: '#DCEBE0', muted: '#5F7068' },
      mist: { name: 'Mist', desc: 'Cool blue-grey', swatch: 'linear-gradient(135deg, #D3E1F2, #5F7BA6)', bg: 'linear-gradient(170deg, #E6EEF8 0%, #E7ECF7 50%, #EEF0F6 100%)', ink: '#2F3F5A', soft: '#DFE7F4', muted: '#5F6B80' },
      sand: { name: 'Sand', desc: 'Warm and low-contrast', swatch: 'linear-gradient(135deg, #F1E3CF, #A88A6E)', bg: 'linear-gradient(170deg, #F6EFE4 0%, #F2EAE1 50%, #ECE5EC 100%)', ink: '#4A3D34', soft: '#EFE5D8', muted: '#77695E' }
    };
    var themeKey = themes[s.theme] ? s.theme : 'dawn';
    var th = themes[themeKey];
    var themeVals = {
      themeVars: { '--bg': th.bg, '--ink': th.ink, '--soft': th.soft, '--muted': th.muted },
      themeName: th.name,
      themeOpts: Object.keys(themes).map(function (k) {
        var t = themes[k]; var on = k === themeKey;
        return { name: t.name, desc: t.desc, bg: t.bg, ink: t.ink, swatch: t.swatch, on: on,
          ring: on ? '0 0 0 2px ' + t.ink : '0 0 0 1px rgba(0,0,0,0.08)',
          pick: function () { self.setState({ theme: k }); } };
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
    var evDetailVals = {
      isEvent: screen === 'event',
      edBack: go(s.evBackTo === 'circle' ? 'circle' : 'home'),
      edTitle: evD.title, edWhen: evD.when, edWhere: evD.where,
      edHost: evDc ? evDc.name + ' circle' : 'Outside circles · friends', edTint: evDc ? evDc.tint : '#E4F1F0',
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
      edSaveRefl: function () { if (refl.feel) setRefl({ done: true }); },
      edReflMo: refl.feel === 'hard' ? 'Thanks for telling me. Showing up when it is hard still counts. Next time I can suggest a smaller event.'
        : (refl.feel === 'good' ? 'Love that! I will suggest Level 2 practice next time.' : 'Okay is a real win. Every event makes the next one easier.'),
      edReflWins: (refl.wins || []).length ? 'You noted: ' + (refl.wins || []).join(', ') + '.' : '',
      edConnect: (evD.people || []).map(function (n) {
        var k = n.toLowerCase(); var canDm = !!dmData[k];
        return { name: n, initial: n[0], canDm: canDm, noDm: !canDm, sent: !!hiSent[k], notSent: !hiSent[k],
          msg: function () { self.setState({ screen: 'dm', dm: k, dmDraft: 'Thanks for last night! Want to build again sometime?', moOpen: false }); },
          hi: function () { var h = Object.assign({}, hiSent); h[k] = true; self.setState({ hiSent: h }); } };
      }),
      reflNudge: !(s.refl && s.refl.e0 && s.refl.e0.done),
      openPast: function () { self.setState({ screen: 'event', evId: 'e0', evBackTo: 'home', moOpen: false, evToast: '' }); }
    };
    var wasKind = s.winType === 'kind';
    var circles = Object.keys(circleData).map(function (k) {
      var c = circleData[k];
      return { name: c.name, initial: c.initial, tint: c.tint, here: c.here, topic: c.topic,
        open: function () { self.setState({ screen: 'circle', circle: k, draft: '', sent: '', menuOpen: false, safetyNote: '', unsafeHandled: false, moOpen: false }); } };
    });
    return Object.assign(evVals, profVals, dmVals, notifVals, themeVals, evDetailVals, {
      circles: circles,
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
      showTabs: ['pause', 'reset', 'win', 'checkin', 'help', 'newEvent'].indexOf(screen) < 0,
      steps: steps,
      homeMood: ciFeel === 'over' ? 'calm' : 'happy',
      moLine: ciFeel === 'over' ? "Thanks for telling me. Let's keep today gentle. Just reading a circle counts." : (ciFeel === 'ready' ? "You're ready to connect! Let's practice, then go for it." : (ciUp === 'none' ? "Let's warm up with one small practice today." : "Let's warm up for your " + upLabels[ciUp].toLowerCase().replace('a ', '') + '.')),
      isLow: battery === 'low', isOkay: battery === 'okay', isFull: battery === 'full',
      lowBg: pick(battery === 'low'), okayBg: pick(battery === 'okay'), fullBg: pick(battery === 'full'),
      lowFg: pickFg(battery === 'low'), okayFg: pickFg(battery === 'okay'), fullFg: pickFg(battery === 'full'),
      setLow: function () { self.setState({ battery: 'low' }); },
      setOkay: function () { self.setState({ battery: 'okay' }); },
      setFull: function () { self.setState({ battery: 'full' }); },
      goHome: go('home'), goCircle: go('circle'), goPractice: go('practice', { pChoice: '', pStarted: false }), goMe: go('me'),
      goReset: go('reset', { trustSent: false }), goFeedback: go('feedback'),
      menuOpen: !!s.menuOpen,
      toggleMenu: function () { self.setState({ menuOpen: !s.menuOpen }); },
      doReport: function () { self.setState({ menuOpen: false, safetyNote: 'Thanks. A moderator will check this chat.' }); },
      doBlock: function () { self.setState({ menuOpen: false, safetyNote: 'Done. You can block anyone, anytime.' }); },
      hasSafetyNote: !!s.safetyNote, safetyNote: s.safetyNote || '',
      isSent: !!sent,
      sentText: drafts[sent] || '',
      jordanReply: replies[sent] || '',
      resultMood: sentKind ? 'happy' : 'calm',
      resultLine: sentKind ? cd.m2[0] + ' replied! That was a brave step.' : "Sent. If it didn't land well, I can help you follow up.",
      resultButton: sentKind ? 'Collect it' : 'Help me follow up',
      resultAction: sentKind ? go('win', { won: true, winType: sent === 'kind' ? 'kind' : 'hello' }) : go('practice', { pChoice: '', pStarted: false }),
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
      toneDot: isAngry ? '#E07A6B' : '#5DBB8E',
      toneLabel: isAngry ? 'Mo: this might sound harsh' : 'Mo: sounds friendly',
      sendBg: draft ? 'var(--ink)' : 'rgba(255,255,255,0.7)',
      sendIcon: draft ? '#FFFFFF' : '#8C83A0',
      send: function () {
        if (!draft) return;
        if (draft === 'angry') self.setState({ screen: 'pause' });
        else self.setState({ sent: draft, draft: '' });
      },
      sayKindly: go('circle', { draft: 'kind' }),
      sendAnyway: go('circle', { sent: 'angry', draft: '' }),
      walkBg: pick(plan === 'walk'), musicBg: pick(plan === 'music'), waterBg: pick(plan === 'water'),
      walkFg: pickFg(plan === 'walk'), musicFg: pickFg(plan === 'music'), waterFg: pickFg(plan === 'water'),
      planWalk: function () { self.setState({ plan: 'walk' }); },
      planMusic: function () { self.setState({ plan: 'music' }); },
      planWater: function () { self.setState({ plan: 'water' }); },
      readyAfterReset: go('circle', { draft: 'kind' }),
      textTrusted: function () { self.setState({ trustSent: true }); },
      trustSent: !!s.trustSent,
      pChosen: !!pChoice, pNotChosen: !pChoice,
      pText: choiceGood ? ps.good : ps.vague,
      pReply: choiceGood ? ps.goodReply : ps.vagueReply,
      pTitle: ps.title, pPartner: ps.partner, pOpener: ps.opener, pHint: ps.hint,
      pGoodText: ps.good, pVagueText: ps.vague,
      showHint: pLevel === 1,
      levelLabel: levelNames[pLevel - 1],
      pPicking: !pStarted, pStarted: pStarted,
      recScenarios: recScenarios, moreScenarios: moreScenarios, pScene: ps.scene, levels: levelList,
      startPractice: function () { self.setState({ pStarted: true, pChoice: '' }); },
      pickGood: function () { self.setState({ pChoice: 'good' }); },
      pickVague: function () { self.setState({ pChoice: 'vague' }); },
      fbTitle: choiceGood ? 'Nailed it' : 'Good start',
      fbStar: choiceGood ? ps.starGood : ps.starVague,
      fbSpark: choiceGood ? ps.sparkGood : ps.sparkVague,
      hasUnsafe: !!cd.m3,
      m3Name: cd.m3 ? cd.m3[0] : '', m3Text: cd.m3 ? cd.m3[1] : '',
      showUnsafeCard: !s.unsafeHandled,
      unsafeReport: function () { self.setState({ unsafeHandled: true, safetyNote: 'Reported. A moderator will review Alex. Thanks for keeping the circle safe.' }); },
      unsafeBlock: function () { self.setState({ unsafeHandled: true, safetyNote: 'Alex is blocked. They can’t message you anymore.' }); },
      unsafeIgnore: function () { self.setState({ unsafeHandled: true }); },
      reqPending: reqState === 'pending', reqChoose: reqState === 'choose', reqDeclined: reqState === 'declined',
      mariaConnected: reqState === 'connected',
      reqAccept: function () { self.setState({ reqState: 'choose' }); },
      reqDecline: function () { self.setState({ reqState: 'declined' }); },
      reqConnect: function () { self.setState({ reqState: 'connected' }); },
      seeSteps: seeSteps, seeHelp: seeHelp,
      seeStepsBg: seeSteps ? 'var(--ink)' : 'var(--soft)', seeStepsFg: seeSteps ? '#FFFFFF' : 'var(--ink)',
      seeHelpBg: seeHelp ? 'var(--ink)' : 'var(--soft)', seeHelpFg: seeHelp ? '#FFFFFF' : 'var(--ink)',
      toggleSeeSteps: function () { self.setState({ seeSteps: !seeSteps }); },
      toggleSeeHelp: function () { self.setState({ seeHelp: !seeHelp }); },
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
      ciSummary: 'Feeling ' + feelLabels[ciFeel].toLowerCase() + (ciUp === 'none' ? '' : ' · ' + upLabels[ciUp].toLowerCase().replace('a ', '') + ' coming up'),
      recList: recList,
      joinLabel: ciFeel === 'over' ? 'Just read tonight' : 'Join the chat',
      homeJoin: go('circle', { circle: 'gaming', draft: '', sent: '', readOnly: ciFeel === 'over', unsafeHandled: false }),
      circlesMoLine: ciFeel === 'over' ? 'Feeling overwhelmed? Try "Just read". No one expects you to post.' : 'You like gaming and music. Start there?',
      filterOpts: chip({ foryou: 'For you', all: 'All', quiet: 'Quiet ones' }, cFilter, 'cFilter'),
      circleCards: Object.keys(circleData).filter(function (k) {
        if (cFilter === 'foryou') return k === 'gaming' || k === 'music';
        if (cFilter === 'quiet') return circleData[k].here <= 3;
        return true;
      }).map(function (k) {
        var c = circleData[k];
        var grads = { gaming: 'linear-gradient(120deg, #F9DCE4, #E3E0F8)', music: 'linear-gradient(120deg, #E3E0F8, #DCE4FA)', anime: 'linear-gradient(120deg, #FBE1D8, #F9DCE4)', cooking: 'linear-gradient(120deg, #DDF1E6, #F6E5C9)', art: 'linear-gradient(120deg, #F6E5C9, #FBE1D8)', tech: 'linear-gradient(120deg, #DCE4FA, #DDF1E6)' };
        return { name: c.name, here: c.here, topic: c.topic, grad: grads[k],
          open: function () { self.setState({ screen: 'circle', circle: k, draft: '', sent: '', readOnly: false, unsafeHandled: false, moOpen: false, safetyNote: '' }); },
          read: function () { self.setState({ screen: 'circle', circle: k, draft: '', sent: '', readOnly: true, unsafeHandled: false, moOpen: false, safetyNote: '' }); } };
      }),
      isReadOnly: readOnly,
      stopReading: function () { self.setState({ readOnly: false }); },
      helpTo: helpTo, helpSent: !!s.helpSent, helpNotSent: !s.helpSent,
      helpPeople: (reqState === 'connected' ? ['Mom', 'Coach Maria'] : ['Mom']).map(function (n) {
        var on = n === helpTo;
        return { name: n, on: on, bg: on ? 'var(--ink)' : 'var(--soft)', fg: on ? '#FFFFFF' : 'var(--ink)', pick: function () { self.setState({ helpTo: n, helpSent: false }); } };
      }),
      sendHelp: function () { self.setState({ helpSent: true }); },
      tabIsHome: screen === 'home', tabIsCircles: screen === 'circles' || screen === 'circle' || screen === 'dm', tabIsMe: screen === 'me',
      homeBg: screen === 'home' ? '#FFFFFF' : 'transparent', homeFg: screen === 'home' ? 'var(--ink)' : '#D9D3E8', homePad: screen === 'home' ? '0 18px' : '0',
      circlesBg: (screen === 'circles' || screen === 'circle' || screen === 'dm') ? '#FFFFFF' : 'transparent', circlesFg: (screen === 'circles' || screen === 'circle' || screen === 'dm') ? 'var(--ink)' : '#D9D3E8', circlesPad: (screen === 'circles' || screen === 'circle' || screen === 'dm') ? '0 18px' : '0',
      meBg: screen === 'me' ? '#FFFFFF' : 'transparent', meFg: screen === 'me' ? 'var(--ink)' : '#D9D3E8', mePad: screen === 'me' ? '0 18px' : '0',
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
      var el = document.querySelector('.bridge-scroll');
      if (el) el.scrollTop = 0;
    }
  }
  renderView(v) {
    return (<>
<div className="bridge-app" style={{...v.themeVars, width: "100%", height: "100%", boxSizing: "border-box", background: "var(--bg)", fontFamily: "Outfit, system-ui, sans-serif", color: "var(--ink)", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative"}}>
<div className="bridge-scroll" style={{flex: "1", minHeight: "0", overflowY: "auto", overflowX: "hidden", width: "100%"}}>

{v.isCheckin && (<>
<div style={{padding: "32px 22px 28px", display: "flex", flexDirection: "column", gap: "22px"}}>
<div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center"}}>
<div className="floaty"><Mo mood="happy" size={96} /></div>
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
<button onClick={v.finishCheckin} style={{height: "56px", borderRadius: "20px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "17px", fontWeight: "500", marginTop: "4px"}}>See my day</button>
</div>
</>)}

{v.isHome && (<>
<div style={{padding: "28px 22px 28px", display: "flex", flexDirection: "column", gap: "18px"}}>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px"}}>
<h1 style={{margin: "0", fontSize: "34px", fontWeight: "600", letterSpacing: "-0.5px"}}>Hi {v.firstName}</h1>
<div style={{display: "flex", alignItems: "center", gap: "8px"}}>
<span style={{background: "rgba(255,255,255,0.75)", borderRadius: "999px", padding: "7px 14px", fontSize: "14px", fontWeight: "500", whiteSpace: "nowrap"}}>{v.steps} brave steps</span>
<button onClick={v.openNotifs} aria-label={v.notifLabel} style={{position: "relative", width: "44px", height: "44px", flex: "0 0 auto", borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 0 0 4 0"></path></svg>
{v.hasNotifCount && (<><span style={{position: "absolute", top: "-2px", right: "-2px", minWidth: "20px", height: "20px", borderRadius: "999px", background: "#E0709A", color: "#FFFFFF", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", boxSizing: "border-box"}}>{v.notifCount}</span></>)}
</button>
</div>
</div>
<div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", background: "rgba(255,255,255,0.55)", borderRadius: "18px", padding: "10px 14px"}}>
<span style={{fontSize: "15px", lineHeight: "1.35", color: "var(--muted)"}}>{v.ciSummary}</span>
<button onClick={v.goCheckin} style={{flex: "0 0 auto", border: "none", background: "transparent", padding: "4px 0", color: "var(--ink)", fontSize: "15px", fontWeight: "500", textDecoration: "underline"}}>Change</button>
</div>
</div>
<div style={{borderRadius: "32px", padding: "4px 0", display: "flex", gap: "14px", alignItems: "center"}}>
<div className="floaty" style={{flex: "0 0 auto"}}><Mo mood={v.homeMood} size={84} /></div>
<p style={{margin: "0", fontSize: "18px", lineHeight: "1.4", fontWeight: "500"}}>{v.moLine}</p>
</div>
<div style={{background: "rgba(255,255,255,0.82)", borderRadius: "32px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px", boxShadow: "0 20px 50px rgba(120,100,170,0.12)"}}>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
<span style={{fontSize: "15px", fontWeight: "500", color: "var(--muted)"}}>Tonight in Gaming</span>
<span style={{display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#3E6B57"}}><span style={{width: "8px", height: "8px", borderRadius: "50%", background: "#5DBB8E", display: "inline-block"}}></span>3 here now</span>
</div>
<h2 style={{margin: "0", fontSize: "23px", fontWeight: "600", lineHeight: "1.2"}}>What game got you hooked?</h2>
<button onClick={v.homeJoin} style={{height: "52px", borderRadius: "20px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "17px", fontWeight: "500", marginTop: "4px"}}>{v.joinLabel}</button>
<button onClick={v.goCircles} style={{height: "44px", border: "none", background: "transparent", color: "var(--ink)", fontSize: "16px", textDecoration: "underline"}}>See all circles</button>
</div>
{v.reflNudge && (<>
<button onClick={v.openPast} style={{textAlign: "left", border: "none", display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.7)", borderRadius: "24px", padding: "12px 14px", color: "var(--ink)"}}>
<Mo mood="happy" size={44} />
<span style={{flex: "1", display: "flex", flexDirection: "column", gap: "2px"}}>
<span style={{fontSize: "16px", fontWeight: "600"}}>How was Minecraft build night?</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>Reflect with Mo and stay in touch · 1 min</span>
</span>
<span aria-hidden="true" style={{fontSize: "20px"}}>›</span>
</button>
</>)}
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>My plans</span>
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
{v.homeEvents.map((ev, $index) => (<React.Fragment key={$index}>
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "26px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 12px 30px rgba(120,100,170,0.10)"}}>
<div style={{background: ev.tint, padding: "10px 16px", fontSize: "13px", fontWeight: "500", color: "var(--muted)"}}>{ev.hostLabel}</div>
<div style={{padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: "6px", flex: "1"}}>
<button onClick={ev.open} style={{textAlign: "left", border: "none", background: "transparent", padding: "0", color: "var(--ink)", display: "flex", flexDirection: "column", gap: "4px"}}>
<span style={{display: "flex", justifyContent: "space-between", width: "100%", gap: "8px"}}><span style={{fontSize: "17px", fontWeight: "600", lineHeight: "1.25"}}>{ev.title}</span><span style={{flex: "0 0 auto", fontSize: "14px", textDecoration: "underline"}}>Details</span></span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>{ev.when} · {ev.where}</span>
</button>
<div style={{display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", marginTop: "2px"}}>
{ev.sense.map((t, $i) => (<React.Fragment key={$i}><span style={{background: "var(--soft)", borderRadius: "999px", padding: "4px 10px", fontSize: "12px"}}>{t}</span></React.Fragment>))}
<span style={{fontSize: "13px", color: "#3E6B57"}}>{ev.goingText}</span>
</div>
<div style={{marginTop: "auto", paddingTop: "8px"}}>
{ev.notMine && (<>
<button onClick={ev.toggle} style={{width: "100%", height: "44px", borderRadius: "16px", border: "none", background: ev.inBg, color: ev.inFg, fontSize: "15px", fontWeight: "500"}}>{ev.inLabel}</button>
</>)}
{ev.isMine && (<>
<div style={{height: "44px", borderRadius: "16px", background: "#E4F1F0", color: "#3E6B57", fontSize: "15px", fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center"}}>You're hosting</div>
</>)}
</div>
</div>
</div>
</React.Fragment>))}
</div>
</div>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>Practice made for you</span>
{v.recList.map((r, $index) => (<React.Fragment key={$index}>
<button onClick={r.start} style={{textAlign: "left", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "26px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px", color: "var(--ink)", boxShadow: "0 12px 30px rgba(120,100,170,0.10)"}}>
<span style={{flex: "1", display: "flex", flexDirection: "column", gap: "4px"}}>
<span style={{fontSize: "17px", fontWeight: "600"}}>{r.title}</span>
<span style={{fontSize: "14px", lineHeight: "1.35", color: "var(--muted)"}}>{r.why}</span>
</span>
<span style={{background: "var(--soft)", borderRadius: "999px", padding: "6px 12px", fontSize: "13px", whiteSpace: "nowrap"}}>{r.level}</span>
</button>
</React.Fragment>))}
</div>
</div>
</>)}

{v.isHelp && (<>
<div style={{width: "100%", minHeight: "100%", boxSizing: "border-box", padding: "26px 22px 30px", display: "flex", flexDirection: "column", gap: "16px", background: "var(--bg)"}}>
<button onClick={v.goHome} aria-label="Back" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center"}}>
<Mo mood="calm" size={100} />
<h1 style={{margin: "0", fontSize: "30px", fontWeight: "600"}}>You're not alone</h1>
<span style={{fontSize: "16px", color: "var(--muted)"}}>Pick what feels right. Real people are here for you.</span>
</div>
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "28px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px"}}>
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
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "28px", padding: "18px", display: "flex", flexDirection: "column", gap: "10px"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>Talk to someone right now</span>
<span style={{fontSize: "15px", color: "var(--muted)"}}>Free, any time of day or night.</span>
<button style={{height: "50px", borderRadius: "18px", border: "none", background: "#FBE1DC", color: "var(--ink)", fontSize: "16px", fontWeight: "500"}}>Call or text 988</button>
</div>
<button onClick={v.goReset} style={{height: "44px", border: "none", background: "transparent", color: "var(--ink)", fontSize: "16px", textDecoration: "underline"}}>Breathe with Mo first</button>
</div>
</>)}

{v.isCircles && (<>
<div style={{padding: "28px 20px 24px", display: "flex", flexDirection: "column", gap: "14px"}}>
<div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", background: "rgba(255,255,255,0.6)", borderRadius: "999px", padding: "4px"}}>
{v.cTabs.map((t, $index) => (<React.Fragment key={$index}>
<button onClick={t.pick} style={{height: "42px", borderRadius: "999px", border: "none", background: t.bg, color: t.fg, fontSize: "15px", fontWeight: "600"}}>{t.label}</button>
</React.Fragment>))}
</div>
{v.showCircleList && (<>
<div style={{display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.7)", borderRadius: "26px", padding: "12px 14px"}}>
<Mo mood="happy" size={52} />
<span style={{fontSize: "16px", lineHeight: "1.4"}}>{v.circlesMoLine}</span>
</div>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.filterOpts.map((fo, $index) => (<React.Fragment key={$index}>
<button onClick={fo.pick} aria-pressed={fo.on} style={{minHeight: "42px", borderRadius: "999px", border: "none", background: fo.bg, color: fo.fg, padding: "8px 16px", fontSize: "15px"}}>{fo.label}</button>
</React.Fragment>))}
</div>
{v.circleCards.map((c, $index) => (<React.Fragment key={$index}>
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "28px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 14px 34px rgba(120,100,170,0.12)"}}>
<div style={{height: "88px", background: c.grad, padding: "16px", boxSizing: "border-box", display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
<span style={{fontSize: "22px", fontWeight: "600"}}>{c.name}</span>
<span style={{background: "#FFFFFF", borderRadius: "999px", padding: "5px 12px", fontSize: "13px", color: "#3E6B57"}}>{c.here} here now</span>
</div>
<div style={{padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: "10px"}}>
<span style={{fontSize: "13px", color: "var(--muted)", letterSpacing: "1px"}}>TONIGHT'S TOPIC</span>
<span style={{fontSize: "19px", fontWeight: "600"}}>{c.topic}</span>
<div style={{display: "flex", gap: "8px"}}>
<button onClick={c.open} style={{flex: "1", height: "46px", borderRadius: "16px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "500"}}>Join</button>
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
<span style={{display: "flex", justifyContent: "space-between", gap: "8px"}}><span style={{fontSize: "17px", fontWeight: "600"}}>{d.name}</span><span style={{fontSize: "13px", color: "var(--muted)"}}>{d.from}</span></span>
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
<div style={{display: "flex", flexDirection: "column"}}><span style={{fontSize: "16px", fontWeight: "600"}}>Alex</span><span style={{fontSize: "13px", color: "var(--muted)"}}>Anime circle · you haven't talked yet</span></div>
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
</>)}

{v.isCircle && (<>
<div style={{display: "flex", flexDirection: "column", minHeight: "100%"}}>
<div style={{padding: "22px 22px 8px", display: "flex", flexDirection: "column", gap: "10px"}}>
<div style={{display: "flex", alignItems: "center", gap: "12px"}}>
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
<button onClick={v.doReport} style={{height: "46px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.85)", color: "var(--ink)", fontSize: "15px", fontWeight: "500"}}>Report</button>
<button onClick={v.doBlock} style={{height: "46px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.85)", color: "var(--ink)", fontSize: "15px", fontWeight: "500"}}>Block</button>
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
<div style={{display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.75)", borderRadius: "20px", padding: "10px 12px 10px 14px"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6E6585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3"></rect><path d="M8 3v4M16 3v4M3.5 10h17"></path></svg>
<button onClick={ev.open} style={{flex: "1", display: "flex", flexDirection: "column", minWidth: "0", textAlign: "left", border: "none", background: "transparent", padding: "0", color: "var(--ink)"}}>
<span style={{fontSize: "15px", fontWeight: "600"}}>{ev.title} <span style={{fontWeight: "400", fontSize: "13px", textDecoration: "underline"}}>Details</span></span>
<span style={{fontSize: "13px", color: "var(--muted)"}}>{ev.when} · {ev.goingText}</span>
</button>
{ev.notMine && (<>
<button onClick={ev.toggle} style={{flex: "0 0 auto", height: "38px", borderRadius: "14px", border: "none", background: ev.inBg, color: ev.inFg, padding: "0 12px", fontSize: "14px", fontWeight: "500"}}>{ev.inLabel}</button>
</>)}
{ev.isMine && (<>
<span style={{flex: "0 0 auto", fontSize: "13px", color: "#3E6B57", fontWeight: "500"}}>Hosting</span>
</>)}
</div>
</React.Fragment>))}
<button onClick={v.newEventCircle} style={{alignSelf: "flex-start", height: "38px", borderRadius: "999px", border: "1.5px dashed #B9B1C8", background: "transparent", color: "var(--ink)", padding: "0 14px", fontSize: "14px", fontWeight: "500"}}>+ Plan an event in {v.cName}</button>
</div>
</div>

<div style={{flex: "1", padding: "12px 22px 16px", display: "flex", flexDirection: "column", gap: "14px"}}>
<div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
<span style={{display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.m1Name}{v.m1CanDm && (<><button onClick={v.m1Dm} style={{border: "none", background: "transparent", padding: "0", color: "var(--ink)", fontSize: "13px", textDecoration: "underline"}}>Message</button></>)}</span>
<div style={{alignSelf: "flex-start", background: "rgba(255,255,255,0.8)", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "80%", fontSize: "17px", lineHeight: "1.45"}}>{v.m1Text}</div>
</div>
<div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
<span style={{display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.m2Name}{v.m2CanDm && (<><button onClick={v.m2Dm} style={{border: "none", background: "transparent", padding: "0", color: "var(--ink)", fontSize: "13px", textDecoration: "underline"}}>Message</button></>)}</span>
<div style={{alignSelf: "flex-start", background: "rgba(255,255,255,0.8)", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "80%", fontSize: "17px", lineHeight: "1.45"}}>{v.m2Text}</div>
</div>
{v.hasUnsafe && (<>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.m3Name} · new member</span>
<div style={{alignSelf: "flex-start", background: "rgba(255,255,255,0.8)", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "80%", fontSize: "17px", lineHeight: "1.45"}}>{v.m3Text}</div>
</div>
{v.showUnsafeCard && (<>
<div className="rise" style={{background: "#FBEDEA", borderRadius: "26px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px"}}>
<div style={{display: "flex", gap: "12px", alignItems: "center"}}>
<Mo mood="worried" size={52} />
<span style={{fontSize: "16px", lineHeight: "1.4"}}>Only you can see this. {v.m3Name} is asking for money and to keep it secret. That's not safe.</span>
</div>
<div style={{display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px"}}>
<button onClick={v.unsafeReport} style={{height: "46px", borderRadius: "16px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "15px", fontWeight: "500"}}>Report</button>
<button onClick={v.unsafeBlock} style={{height: "46px", borderRadius: "16px", border: "none", background: "#FFFFFF", color: "var(--ink)", fontSize: "15px", fontWeight: "500"}}>Block</button>
<button onClick={v.unsafeIgnore} style={{height: "46px", borderRadius: "16px", border: "none", background: "transparent", color: "var(--ink)", fontSize: "15px", textDecoration: "underline"}}>Not now</button>
</div>
</div>
</>)}
</div>
</>)}

{v.isSent && (<>
<div style={{display: "flex", flexDirection: "column", gap: "14px"}}>
<div style={{alignSelf: "flex-end", background: "var(--ink)", color: "#FFFFFF", borderRadius: "24px 24px 8px 24px", padding: "13px 17px", maxWidth: "80%", fontSize: "17px", lineHeight: "1.45"}}>{v.sentText}</div>
<div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", paddingLeft: "4px"}}>{v.m2Name}</span>
<div style={{alignSelf: "flex-start", background: "rgba(255,255,255,0.8)", borderRadius: "24px 24px 24px 8px", padding: "13px 17px", maxWidth: "80%", fontSize: "17px", lineHeight: "1.45"}}>{v.jordanReply}</div>
</div>
<div className="rise" style={{background: "rgba(255,255,255,0.9)", borderRadius: "28px", padding: "16px", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 16px 40px rgba(120,100,170,0.18)"}}>
<div style={{flex: "0 0 auto"}}><Mo mood={v.resultMood} size={64} /></div>
<div style={{display: "flex", flexDirection: "column", gap: "10px", flex: "1"}}>
<p style={{margin: "0", fontSize: "16px", lineHeight: "1.4"}}>{v.resultLine}</p>
<button onClick={v.resultAction} style={{height: "46px", borderRadius: "16px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "500"}}>{v.resultButton}</button>
</div>
</div>
</div>
</>)}

{v.isReadOnly && (<>
<div style={{marginTop: "auto", background: "rgba(255,255,255,0.6)", borderRadius: "26px", padding: "14px", display: "flex", alignItems: "center", gap: "12px"}}>
<Mo mood="calm" size={44} />
<span style={{flex: "1", fontSize: "15px", lineHeight: "1.4"}}>Reading quietly counts. Say hi only if you want to.</span>
<button onClick={v.stopReading} style={{height: "44px", borderRadius: "16px", border: "none", background: "var(--ink)", color: "#FFFFFF", padding: "0 14px", fontSize: "15px", fontWeight: "500"}}>Say hi</button>
</div>
</>)}

{v.showSuggest && (<>
<div style={{marginTop: "auto", background: "rgba(255,255,255,0.6)", borderRadius: "26px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px"}}>
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
<div style={{padding: "10px 22px 18px", display: "flex", flexDirection: "column", gap: "8px"}}>
{v.hasDraft && (<>
<span style={{alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px", background: v.toneBg, borderRadius: "999px", padding: "6px 14px", fontSize: "14px", color: "var(--ink)"}}><span style={{width: "8px", height: "8px", borderRadius: "50%", background: v.toneDot, display: "inline-block"}}></span>{v.toneLabel}</span>
</>)}
<div style={{display: "flex", gap: "10px", alignItems: "center"}}>
<div style={{flex: "1", minHeight: "52px", borderRadius: "24px", background: "rgba(255,255,255,0.85)", boxShadow: v.draftRing, padding: "12px 18px", display: "flex", alignItems: "center", fontSize: "16px", color: v.draftColor, lineHeight: "1.35"}}>{v.draftShown}</div>
<button onClick={v.send} aria-label="Send message" style={{width: "52px", height: "52px", flex: "0 0 auto", borderRadius: "50%", border: "none", background: v.sendBg, display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{stroke: v.sendIcon}} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"></path></svg>
</button>
</div>
</div>
</>)}
</div>
</>)}

{v.isNewEvent && (<>
<div style={{padding: "22px 22px 28px", display: "flex", flexDirection: "column", gap: "16px"}}>
<div style={{display: "flex", alignItems: "center", gap: "12px"}}>
<button onClick={v.evBack} aria-label="Back" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<h1 style={{margin: "0", fontSize: "22px", fontWeight: "600", lineHeight: "1.25"}}>{v.evTitle}</h1>
</div>
<span style={{fontSize: "16px", fontWeight: "600"}}>Host it in</span>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.hostOpts.map((o, $index) => (<React.Fragment key={$index}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "42px", borderRadius: "999px", border: "none", padding: "8px 16px", fontSize: "15px", background: o.bg, color: o.fg}}>{o.label}</button>
</React.Fragment>))}
</div>
<span style={{fontSize: "16px", fontWeight: "600"}}>What</span>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.whatOpts.map((o, $index) => (<React.Fragment key={$index}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "42px", borderRadius: "999px", border: "none", padding: "8px 16px", fontSize: "15px", background: o.bg, color: o.fg}}>{o.label}</button>
</React.Fragment>))}
</div>
<span style={{fontSize: "16px", fontWeight: "600"}}>When</span>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.whenOpts.map((o, $index) => (<React.Fragment key={$index}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "42px", borderRadius: "999px", border: "none", padding: "8px 16px", fontSize: "15px", background: o.bg, color: o.fg}}>{o.label}</button>
</React.Fragment>))}
</div>
<span style={{fontSize: "16px", fontWeight: "600"}}>Where</span>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.whereOpts.map((o, $index) => (<React.Fragment key={$index}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "42px", borderRadius: "999px", border: "none", padding: "8px 16px", fontSize: "15px", background: o.bg, color: o.fg}}>{o.label}</button>
</React.Fragment>))}
</div>
<span style={{fontSize: "16px", fontWeight: "600"}}>Sound</span>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.soundOpts.map((o, $index) => (<React.Fragment key={$index}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "42px", borderRadius: "999px", border: "none", padding: "8px 16px", fontSize: "15px", background: o.bg, color: o.fg}}>{o.label}</button>
</React.Fragment>))}
</div>
<span style={{fontSize: "16px", fontWeight: "600"}}>Lighting</span>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.lightOpts.map((o, $index) => (<React.Fragment key={$index}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "42px", borderRadius: "999px", border: "none", padding: "8px 16px", fontSize: "15px", background: o.bg, color: o.fg}}>{o.label}</button>
</React.Fragment>))}
</div>
{v.evInCircle && (<>
<span style={{fontSize: "16px", fontWeight: "600"}}>How many people</span>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.sizeOpts.map((o, $index) => (<React.Fragment key={$index}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "42px", borderRadius: "999px", border: "none", padding: "8px 16px", fontSize: "15px", background: o.bg, color: o.fg}}>{o.label}</button>
</React.Fragment>))}
</div>
</>)}
{v.evIsOutside && (<>
<span style={{fontSize: "16px", fontWeight: "600"}}>Invite friends you met</span>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.inviteOpts.map((o, $index) => (<React.Fragment key={$index}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "42px", borderRadius: "999px", border: "none", padding: "8px 16px", fontSize: "15px", background: o.bg, color: o.fg}}>{o.label}</button>
</React.Fragment>))}
</div>
</>)}
<div style={{display: "flex", gap: "12px", alignItems: "flex-start", background: "rgba(255,255,255,0.7)", borderRadius: "24px", padding: "14px"}}>
<Mo mood="happy" size={44} />
<div style={{flex: "1", display: "flex", flexDirection: "column", gap: "10px"}}>
<span style={{fontSize: "15px", lineHeight: "1.4"}}>{v.evTip}</span>
{v.evInPerson && (<>
<button onClick={v.toggleShare} style={{alignSelf: "flex-start", minHeight: "42px", borderRadius: "999px", border: "none", padding: "8px 16px", fontSize: "15px", background: v.shareBg, color: v.shareFg}}>{v.shareLabel}</button>
</>)}
</div>
</div>
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "22px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "4px"}}>
<span style={{fontSize: "13px", color: "var(--muted)", letterSpacing: "1px"}}>PREVIEW</span>
<span style={{fontSize: "17px", fontWeight: "600"}}>{v.evPreview}</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>{v.evPreviewWhere}</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>{v.evPreviewSense}</span>
</div>
<button onClick={v.createEvent} style={{height: "56px", borderRadius: "22px", border: "none", background: v.createBg, color: "#FFFFFF", fontSize: "17px", fontWeight: "500"}}>Create event</button>
</div>
</>)}

{v.isDm && (<>
<div style={{display: "flex", flexDirection: "column", minHeight: "100%"}}>
<div style={{padding: "22px 22px 8px", display: "flex", alignItems: "center", gap: "12px"}}>
<button onClick={v.dmBack} aria-label="Back to messages" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<span style={{flex: "0 0 auto", width: "44px", height: "44px", borderRadius: "50%", background: v.dmTint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "600"}}>{v.dmInitial}</span>
<div style={{display: "flex", flexDirection: "column", flex: "1"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>{v.dmName}</span>
<span style={{fontSize: "13px", color: "var(--muted)"}}>{v.dmFrom}</span>
</div>
</div>
<div style={{flex: "1", padding: "12px 22px 12px", display: "flex", flexDirection: "column", gap: "10px"}}>
{v.dmMessages.map((m, $index) => (<React.Fragment key={$index}>
<div style={{alignSelf: m.align, background: m.bg, color: m.fg, borderRadius: m.radius, padding: "12px 16px", maxWidth: "80%", fontSize: "16px", lineHeight: "1.45"}}>{m.text}</div>
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
<div style={{padding: "6px 22px 16px", display: "flex", flexDirection: "column", gap: "8px"}}>
{v.dmHarsh && (<>
<div className="rise" style={{background: "#FBEDEA", borderRadius: "20px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px"}}>
<div style={{display: "flex", gap: "8px", alignItems: "center"}}><Mo mood="worried" size={32} /><span style={{fontSize: "14px", lineHeight: "1.35"}}>This might sound harsh to {v.dmName}.</span></div>
<div style={{display: "flex", gap: "8px"}}>
<button onClick={v.dmSayGently} style={{flex: "1", height: "40px", borderRadius: "14px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "14px", fontWeight: "500"}}>Say it gently</button>
<button onClick={v.dmSendAnyway} style={{flex: "1", height: "40px", borderRadius: "14px", border: "none", background: "#FFFFFF", color: "var(--ink)", fontSize: "14px"}}>Send anyway</button>
</div>
</div>
</>)}
<div style={{display: "flex", gap: "10px", alignItems: "center"}}>
<input value={v.dmDraft} onChange={v.setDmDraft} onKeyDown={v.dmKey} placeholder={"Message " + v.dmName} aria-label={"Message " + v.dmName} style={{flex: "1", minWidth: "0", height: "52px", borderRadius: "24px", border: "none", background: "rgba(255,255,255,0.9)", padding: "0 18px", fontSize: "16px", fontFamily: "inherit", color: "var(--ink)", outline: "none", boxSizing: "border-box"}} />
<button onClick={v.sendDm} aria-label="Send message" style={{width: "52px", height: "52px", flex: "0 0 auto", borderRadius: "50%", border: "none", background: v.dmSendBg, display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"></path></svg>
</button>
</div>
</div>
</div>
</>)}

{v.isNotifs && (<>
<div style={{padding: "22px 22px 28px", display: "flex", flexDirection: "column", gap: "12px"}}>
<div style={{display: "flex", alignItems: "center", gap: "12px"}}>
<button onClick={v.notifBack} aria-label="Back" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<h1 style={{margin: "0", fontSize: "24px", fontWeight: "600"}}>Notifications</h1>
</div>
<div style={{display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.6)", borderRadius: "22px", padding: "12px 14px"}}>
<Mo mood="calm" size={40} />
<span style={{flex: "1", fontSize: "14px", lineHeight: "1.4"}}>{v.notifMoLine}</span>
</div>
<button onClick={v.togglePause} style={{alignSelf: "flex-start", minHeight: "42px", borderRadius: "999px", border: "none", background: v.pauseBg, color: v.pauseFg, padding: "8px 16px", fontSize: "15px"}}>{v.pauseLabel}</button>
<span style={{fontSize: "16px", fontWeight: "600", marginTop: "4px"}}>New</span>
{v.notifNew.map((n, $index) => (<React.Fragment key={$index}>
<button onClick={n.open} style={{textAlign: "left", display: "flex", gap: "12px", alignItems: "flex-start", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "22px", padding: "14px", color: "var(--ink)", boxShadow: "0 10px 26px rgba(120,100,170,0.08)"}}>
<span style={{flex: "0 0 auto", width: "40px", height: "40px", borderRadius: "14px", background: "var(--soft)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={n.path}></path></svg>
</span>
<span style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px"}}>
<span style={{display: "flex", justifyContent: "space-between", gap: "8px"}}><span style={{fontSize: "16px", fontWeight: "600", lineHeight: "1.3"}}>{n.title}</span><span style={{flex: "0 0 auto", fontSize: "13px", color: "var(--muted)"}}>{n.time}</span></span>
<span style={{fontSize: "14px", lineHeight: "1.4", color: "var(--muted)"}}>{n.body}</span>
</span>
{n.isNew && (<><span aria-label="New" style={{flex: "0 0 auto", width: "10px", height: "10px", borderRadius: "50%", background: "#E0709A", marginTop: "6px"}}></span></>)}
</button>
</React.Fragment>))}
<span style={{fontSize: "16px", fontWeight: "600", marginTop: "4px"}}>Earlier</span>
{v.notifEarlier.map((n, $index) => (<React.Fragment key={$index}>
<button onClick={n.open} style={{textAlign: "left", display: "flex", gap: "12px", alignItems: "flex-start", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "22px", padding: "14px", color: "var(--ink)", boxShadow: "0 10px 26px rgba(120,100,170,0.08)"}}>
<span style={{flex: "0 0 auto", width: "40px", height: "40px", borderRadius: "14px", background: "var(--soft)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={n.path}></path></svg>
</span>
<span style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px"}}>
<span style={{display: "flex", justifyContent: "space-between", gap: "8px"}}><span style={{fontSize: "16px", fontWeight: "600", lineHeight: "1.3"}}>{n.title}</span><span style={{flex: "0 0 auto", fontSize: "13px", color: "var(--muted)"}}>{n.time}</span></span>
<span style={{fontSize: "14px", lineHeight: "1.4", color: "var(--muted)"}}>{n.body}</span>
</span>
{n.isNew && (<><span aria-label="New" style={{flex: "0 0 auto", width: "10px", height: "10px", borderRadius: "50%", background: "#E0709A", marginTop: "6px"}}></span></>)}
</button>
</React.Fragment>))}
</div>
</>)}

{v.isEvent && (<>
<div style={{padding: "22px 22px 28px", display: "flex", flexDirection: "column", gap: "14px"}}>
<div style={{display: "flex", alignItems: "center", gap: "12px"}}>
<button onClick={v.edBack} aria-label="Back" style={{width: "44px", height: "44px", flex: "0 0 auto", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<span style={{background: v.edTint, borderRadius: "999px", padding: "6px 12px", fontSize: "13px", fontWeight: "500"}}>{v.edHost}</span>
</div>
<div style={{display: "flex", flexDirection: "column", gap: "4px"}}>
<h1 style={{margin: "0", fontSize: "26px", fontWeight: "600", lineHeight: "1.2"}}>{v.edTitle}</h1>
<span style={{fontSize: "15px", color: "var(--muted)"}}>{v.edWhen} · {v.edWhere}</span>
</div>

<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "26px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 12px 30px rgba(120,100,170,0.10)"}}>
<span style={{fontSize: "17px", fontWeight: "600"}}>What to expect</span>
<div style={{display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px"}}>
{v.edSense.map((x, $index) => (<React.Fragment key={$index}>
<div style={{background: "var(--soft)", borderRadius: "18px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={x.path}></path></svg>
<span style={{fontSize: "13px", color: "var(--muted)"}}>{x.label}</span>
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
{v.edCanRsvp && (<>
<button onClick={v.edToggle} style={{height: "50px", borderRadius: "18px", border: "none", background: v.edInBg, color: v.edInFg, fontSize: "16px", fontWeight: "500"}}>{v.edInLabel}</button>
</>)}
{v.edIsMine && (<>
<div style={{height: "46px", borderRadius: "16px", background: "#E4F1F0", color: "#3E6B57", fontSize: "15px", fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center"}}>You're hosting</div>
</>)}
</div>

{v.edShowPrepHint && (<>
<span style={{fontSize: "14px", color: "var(--muted)", padding: "0 4px"}}>Tap "I'm in" and Mo will help you get ready.</span>
</>)}

{v.edShowPrep && (<>
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "26px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 12px 30px rgba(120,100,170,0.10)"}}>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}><span style={{fontSize: "17px", fontWeight: "600"}}>Get ready with Mo</span><span style={{fontSize: "13px", color: "var(--muted)"}}>{v.edPrepCount}</span></div>
<button onClick={v.edPractice} style={{textAlign: "left", border: "none", display: "flex", gap: "12px", alignItems: "center", background: "var(--soft)", borderRadius: "20px", padding: "12px", color: "var(--ink)"}}>
<Mo mood="happy" size={44} />
<span style={{flex: "1", display: "flex", flexDirection: "column", gap: "2px"}}>
<span style={{fontSize: "13px", color: "var(--muted)"}}>Practice first</span>
<span style={{fontSize: "16px", fontWeight: "600"}}>{v.edPracticeTitle}</span>
<span style={{fontSize: "13px", color: "var(--muted)"}}>{v.edPracticeWhy}</span>
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
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "26px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 12px 30px rgba(120,100,170,0.10)"}}>
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
<button onClick={v.edSaveRefl} style={{height: "48px", borderRadius: "18px", border: "none", background: v.edSaveBg, color: "#FFFFFF", fontSize: "16px", fontWeight: "500"}}>Save reflection</button>
<span style={{fontSize: "13px", color: "var(--muted)"}}>Only you see this.</span>
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
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "26px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 12px 30px rgba(120,100,170,0.10)"}}>
<span style={{fontSize: "17px", fontWeight: "600"}}>Stay in touch</span>
<span style={{fontSize: "14px", color: "var(--muted)", marginTop: "-6px"}}>People you met at this event</span>
{v.edConnect.map((c, $index) => (<React.Fragment key={$index}>
<div style={{display: "flex", alignItems: "center", gap: "12px"}}>
<span style={{flex: "0 0 auto", width: "40px", height: "40px", borderRadius: "50%", background: "var(--soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "600"}}>{c.initial}</span>
<span style={{flex: "1", fontSize: "16px", fontWeight: "500"}}>{c.name}</span>
{c.canDm && (<><button onClick={c.msg} style={{height: "40px", borderRadius: "14px", border: "none", background: "var(--ink)", color: "#FFFFFF", padding: "0 14px", fontSize: "14px", fontWeight: "500"}}>Message</button></>)}
{c.noDm && (<>
{c.notSent && (<><button onClick={c.hi} style={{height: "40px", borderRadius: "14px", border: "none", background: "var(--soft)", color: "var(--ink)", padding: "0 14px", fontSize: "14px", fontWeight: "500"}}>Say hi</button></>)}
{c.sent && (<><span style={{fontSize: "14px", color: "#3E6B57"}}>Request sent ✓</span></>)}
</>)}
</div>
</React.Fragment>))}
<span style={{fontSize: "13px", color: "var(--muted)"}}>"Say hi" sends a message request. They choose whether to accept.</span>
</div>
</>)}
</div>
</>)}

{v.isPause && (<>
<div style={{width: "100%", minHeight: "100%", boxSizing: "border-box", padding: "26px 22px 30px", display: "flex", flexDirection: "column", background: "var(--bg)"}}>
<button onClick={v.goCircle} aria-label="Back to chat" style={{width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
</button>
<div style={{flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "18px"}}>
<div className="rise" style={{background: "rgba(255,255,255,0.85)", borderRadius: "34px", padding: "26px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center", boxShadow: "0 24px 60px rgba(120,100,170,0.2)"}}>
<div className="floaty"><Mo mood="worried" size={120} /></div>
<span style={{fontSize: "27px", fontWeight: "600", lineHeight: "1.2"}}>Let's take a breath together</span>
<span style={{fontSize: "17px", lineHeight: "1.45", color: "var(--muted)"}}>This might hurt Jordan's feelings. You can still send it. You decide.</span>
<div style={{width: "100%", background: "#FBEDEA", borderRadius: "20px", padding: "14px 16px", textAlign: "left", fontSize: "16px", lineHeight: "1.4"}}>"Zelda?? Seriously, that's the most overrated answer ever."</div>
<div style={{display: "flex", flexDirection: "column", gap: "10px", width: "100%", marginTop: "4px"}}>
<button onClick={v.sayKindly} style={{height: "54px", borderRadius: "20px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "17px", fontWeight: "500"}}>Say it gently</button>
<button onClick={v.goReset} style={{height: "54px", borderRadius: "20px", border: "none", background: "var(--soft)", color: "var(--ink)", fontSize: "17px", fontWeight: "500"}}>Breathe with Mo</button>
<button onClick={v.sendAnyway} style={{height: "44px", border: "none", background: "transparent", color: "var(--muted)", fontSize: "16px", textDecoration: "underline"}}>Send anyway</button>
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
<span className="rise" style={{fontSize: "15px", color: "#3E6B57"}}>Sent to Mom: "Can you call me when you're free?"</span>
</>)}
</div>
</div>
</>)}

{v.isPractice && (<>
<div style={{padding: "28px 22px", display: "flex", flexDirection: "column", gap: "16px"}}>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
<h1 style={{margin: "0", fontSize: "32px", fontWeight: "600"}}>Practice</h1>
<span style={{background: "rgba(255,255,255,0.75)", borderRadius: "999px", padding: "7px 14px", fontSize: "14px"}}>{v.levelLabel}</span>
</div>
{v.pPicking && (<>
<div style={{display: "flex", flexDirection: "column", gap: "14px"}}>
<div style={{background: "rgba(255,255,255,0.82)", borderRadius: "28px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px"}}>
<Mo mood="happy" size={56} />
<span style={{fontSize: "17px", lineHeight: "1.4"}}>Pick something to practice. It's just between us.</span>
</div>
<span style={{fontSize: "16px", fontWeight: "600"}}>Made for you today</span>
{v.recScenarios.map((sc, $index) => (<React.Fragment key={$index}>
<button onClick={sc.pick} style={{textAlign: "left", minHeight: "60px", borderRadius: "20px", border: "none", background: sc.bg, color: sc.fg, padding: "12px 16px", display: "flex", flexDirection: "column", gap: "2px"}}>
<span style={{fontSize: "16px", fontWeight: "600"}}>{sc.title}</span>
<span style={{fontSize: "14px"}}>{sc.group}</span>
</button>
</React.Fragment>))}
<span style={{fontSize: "16px", fontWeight: "600"}}>More to practice</span>
{v.moreScenarios.map((sc, $index) => (<React.Fragment key={$index}>
<button onClick={sc.pick} style={{textAlign: "left", minHeight: "60px", borderRadius: "20px", border: "none", background: sc.bg, color: sc.fg, padding: "12px 16px", display: "flex", flexDirection: "column", gap: "2px"}}>
<span style={{fontSize: "16px", fontWeight: "600"}}>{sc.title}</span>
<span style={{fontSize: "14px"}}>{sc.group}</span>
</button>
</React.Fragment>))}
<span style={{fontSize: "16px", fontWeight: "500"}}>Pick a level</span>
<div style={{display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px"}}>
{v.levels.map((lv, $index) => (<React.Fragment key={$index}>
<button onClick={lv.pick} style={{minHeight: "64px", borderRadius: "18px", border: "none", background: lv.bg, color: lv.fg, padding: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px"}}>
<span style={{fontSize: "16px", fontWeight: "600"}}>{lv.name}</span>
<span style={{fontSize: "13px"}}>{lv.desc}</span>
</button>
</React.Fragment>))}
</div>
<button onClick={v.startPractice} style={{height: "54px", borderRadius: "20px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "17px", fontWeight: "500"}}>Start practice</button>
</div>
</>)}
{v.pStarted && (<>
<div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
<div style={{background: "rgba(255,255,255,0.82)", borderRadius: "28px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px"}}>
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
{v.pNotChosen && (<>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
{v.showHint && (<>
<div style={{background: "var(--soft)", borderRadius: "20px", padding: "12px 16px", fontSize: "16px", lineHeight: "1.4"}}>Hint from Mo: {v.pHint}</div>
</>)}
<button onClick={v.pickGood} style={{textAlign: "left", minHeight: "56px", borderRadius: "20px", border: "none", background: "rgba(255,255,255,0.85)", padding: "12px 16px", fontSize: "16px", lineHeight: "1.4", color: "var(--ink)"}}>"{v.pGoodText}"</button>
<button onClick={v.pickVague} style={{textAlign: "left", minHeight: "56px", borderRadius: "20px", border: "none", background: "rgba(255,255,255,0.85)", padding: "12px 16px", fontSize: "16px", lineHeight: "1.4", color: "var(--ink)"}}>"{v.pVagueText}"</button>
</div>
</>)}
{v.pChosen && (<>
<button onClick={v.goFeedback} style={{height: "54px", borderRadius: "20px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "17px", fontWeight: "500"}}>See how I did</button>
</>)}
</div>
</>)}
</div>
</>)}

{v.isFeedback && (<>
<div style={{padding: "34px 22px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center"}}>
<div className="floaty"><Mo mood="happy" size={120} /></div>
<h1 style={{margin: "0", fontSize: "32px", fontWeight: "600"}}>{v.fbTitle}</h1>
<div style={{width: "100%", background: "rgba(255,255,255,0.85)", borderRadius: "26px", padding: "18px", textAlign: "left", display: "flex", flexDirection: "column", gap: "4px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", letterSpacing: "1px"}}>WHAT WENT WELL</span>
<span style={{fontSize: "17px", lineHeight: "1.45"}}>{v.fbStar}</span>
</div>
<div style={{width: "100%", background: "var(--soft)", borderRadius: "26px", padding: "18px", textAlign: "left", display: "flex", flexDirection: "column", gap: "4px"}}>
<span style={{fontSize: "14px", color: "var(--muted)", letterSpacing: "1px"}}>ONE THING TO TRY</span>
<span style={{fontSize: "17px", lineHeight: "1.45"}}>{v.fbSpark}</span>
</div>
<div style={{width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px"}}>
<button onClick={v.goGaming} style={{height: "54px", borderRadius: "20px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "17px", fontWeight: "500"}}>Try it for real</button>
<button onClick={v.goPractice} style={{height: "54px", borderRadius: "20px", border: "none", background: "rgba(255,255,255,0.8)", color: "var(--ink)", fontSize: "17px", fontWeight: "500"}}>Practice again</button>
</div>
</div>
</>)}

{v.isWin && (<>
<div style={{width: "100%", minHeight: "100%", boxSizing: "border-box", padding: "50px 22px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", textAlign: "center", background: "var(--bg)"}}>
<span style={{fontSize: "15px", color: "var(--muted)", letterSpacing: "1px"}}>BRAVE STEP UNLOCKED</span>
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
<span className="rise" style={{width: "14px", height: "14px", borderRadius: "50%", background: "#F29BAE", display: "inline-block"}}></span>
<span style={{fontSize: "15px", marginLeft: "6px"}}>5 this week</span>
</div>
<button onClick={v.finishWin} style={{width: "100%", height: "54px", borderRadius: "20px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "17px", fontWeight: "500", marginTop: "auto"}}>Add to my collection</button>
</div>
</>)}

{v.isMe && (<>
<div style={{padding: "28px 22px", display: "flex", flexDirection: "column", gap: "18px"}}>
<div style={{display: "flex", alignItems: "center", gap: "16px"}}>
<div style={{position: "relative", flex: "0 0 auto"}}>
{v.hasPhoto && (<><img src={v.pPhoto} alt="Your profile photo" style={{width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", display: "block"}} /></>)}
{v.noPhoto && (<><span style={{width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(140deg, #F7C9D4, #C9B6F0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: "600", color: "var(--ink)"}}>{v.initials}</span></>)}
<label aria-label="Change profile photo" style={{position: "absolute", right: "-4px", bottom: "-4px", width: "30px", height: "30px", borderRadius: "50%", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #FFFFFF"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"></path><circle cx="12" cy="13" r="3.5"></circle></svg>
<input type="file" accept="image/*" onChange={v.pickPhoto} style={{display: "none"}} />
</label>
</div>
<div style={{display: "flex", flexDirection: "column", minWidth: "0"}}>
<h1 style={{margin: "0", fontSize: "28px", fontWeight: "600", lineHeight: "1.15"}}>{v.fullName}</h1>
<span style={{fontSize: "15px", color: "var(--muted)"}}>{v.steps} brave steps this week</span>
</div>
</div>
{v.reqPending && (<>
<div className="rise" style={{background: "rgba(255,255,255,0.9)", borderRadius: "28px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 16px 40px rgba(120,100,170,0.16)"}}>
<div style={{display: "flex", gap: "12px", alignItems: "center"}}>
<Mo mood="happy" size={52} />
<span style={{fontSize: "18px", fontWeight: "600"}}>Coach Maria wants to connect</span>
</div>
<p style={{margin: "0", fontSize: "16px", lineHeight: "1.45", color: "var(--muted)"}}>Maria from First Place would like to support you. She won't see anything unless you choose.</p>
<div style={{display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px"}}>
<button onClick={v.reqAccept} style={{height: "50px", borderRadius: "18px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "500"}}>Accept</button>
<button onClick={v.reqDecline} style={{height: "50px", borderRadius: "18px", border: "none", background: "var(--soft)", color: "var(--ink)", fontSize: "16px", fontWeight: "500"}}>Not now</button>
</div>
</div>
</>)}
{v.reqChoose && (<>
<div className="rise" style={{background: "rgba(255,255,255,0.9)", borderRadius: "28px", padding: "18px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 16px 40px rgba(120,100,170,0.16)"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>What can Maria see?</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>Tap to choose. You can change this later.</span>
<div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
<button onClick={v.toggleSeeSteps} aria-pressed={v.seeSteps} style={{minHeight: "46px", borderRadius: "999px", border: "none", background: v.seeStepsBg, color: v.seeStepsFg, padding: "8px 16px", fontSize: "15px", fontWeight: "500"}}>My brave steps</button>
<button onClick={v.toggleSeeHelp} aria-pressed={v.seeHelp} style={{minHeight: "46px", borderRadius: "999px", border: "none", background: v.seeHelpBg, color: v.seeHelpFg, padding: "8px 16px", fontSize: "15px", fontWeight: "500"}}>My "I need help" texts</button>
</div>
<span style={{fontSize: "14px", color: "var(--muted)"}}>Never shared: your chats, check-ins and pauses.</span>
<button onClick={v.reqConnect} style={{height: "50px", borderRadius: "18px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "500", marginTop: "4px"}}>Connect</button>
</div>
</>)}
{v.reqDeclined && (<>
<div style={{background: "rgba(255,255,255,0.55)", borderRadius: "20px", padding: "12px 16px", fontSize: "15px", textAlign: "center"}}>Declined privately. Maria isn't told why.</div>
</>)}
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>My profile</span>
{v.profView && (<><button onClick={v.editProfile} style={{height: "38px", borderRadius: "999px", border: "none", background: "rgba(255,255,255,0.85)", color: "var(--ink)", padding: "0 14px", fontSize: "15px", fontWeight: "500"}}>Edit</button></>)}
</div>
<div style={{background: "rgba(255,255,255,0.9)", borderRadius: "26px", padding: "6px 18px", display: "flex", flexDirection: "column"}}>
{v.profView && (<>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #EEE8F5"}}><span style={{fontSize: "14px", color: "var(--muted)"}}>First name</span><span style={{fontSize: "16px", fontWeight: "500", textAlign: "right", wordBreak: "break-all"}}>{v.pFirst}</span></div>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #EEE8F5"}}><span style={{fontSize: "14px", color: "var(--muted)"}}>Last name</span><span style={{fontSize: "16px", fontWeight: "500", textAlign: "right", wordBreak: "break-all"}}>{v.pLast}</span></div>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #EEE8F5"}}><span style={{fontSize: "14px", color: "var(--muted)"}}>Gender</span><span style={{fontSize: "16px", fontWeight: "500", textAlign: "right", wordBreak: "break-all"}}>{v.pGender}</span></div>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px 0"}}><span style={{fontSize: "14px", color: "var(--muted)"}}>Email</span><span style={{fontSize: "16px", fontWeight: "500", textAlign: "right", wordBreak: "break-all"}}>{v.pEmail}</span></div>
</>)}
{v.profEdit && (<>
<div style={{display: "flex", flexDirection: "column", gap: "14px", padding: "14px 0"}}>
<label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", color: "var(--muted)"}}>First name<input type="text" value={v.pFirst} onChange={v.setFirst} autoComplete="given-name" style={{height: "48px", borderRadius: "16px", border: "1.5px solid #DCD3EA", background: "#FFFFFF", padding: "0 14px", fontSize: "16px", fontFamily: "inherit", color: "var(--ink)", width: "100%", boxSizing: "border-box"}} /></label>
<label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", color: "var(--muted)"}}>Last name<input type="text" value={v.pLast} onChange={v.setLast} autoComplete="family-name" style={{height: "48px", borderRadius: "16px", border: "1.5px solid #DCD3EA", background: "#FFFFFF", padding: "0 14px", fontSize: "16px", fontFamily: "inherit", color: "var(--ink)", width: "100%", boxSizing: "border-box"}} /></label>
<div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
<span style={{fontSize: "14px", color: "var(--muted)"}}>Gender</span>
<div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
{v.genderOpts.map((o, $index) => (<React.Fragment key={$index}>
<button onClick={o.pick} aria-pressed={o.on} style={{minHeight: "40px", borderRadius: "999px", border: "none", background: o.bg, color: o.fg, padding: "8px 14px", fontSize: "14px", boxShadow: "0 0 0 1px #E6DEF1"}}>{o.label}</button>
</React.Fragment>))}
</div>
</div>
<label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", color: "var(--muted)"}}>Email<input type="email" value={v.pEmail} onChange={v.setEmail} autoComplete="email" style={{height: "48px", borderRadius: "16px", border: "1.5px solid #DCD3EA", background: "#FFFFFF", padding: "0 14px", fontSize: "16px", fontFamily: "inherit", color: "var(--ink)", width: "100%", boxSizing: "border-box"}} /></label>
{v.hasPhoto && (<><button onClick={v.removePhoto} style={{alignSelf: "flex-start", height: "40px", border: "none", background: "transparent", color: "var(--ink)", fontSize: "15px", textDecoration: "underline", padding: "0"}}>Remove photo</button></>)}
<button onClick={v.saveProfile} style={{height: "50px", borderRadius: "18px", border: "none", background: "var(--ink)", color: "#FFFFFF", fontSize: "16px", fontWeight: "500"}}>Save</button>
</div>
</>)}
</div>
<span style={{fontSize: "13px", lineHeight: "1.4", color: "var(--muted)", padding: "0 4px"}}>In circles, people only see your first name and photo. Your email and gender stay private.</span>
</div>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
<span style={{fontSize: "18px", fontWeight: "600"}}>Theme</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>All calm, low-glare colors</span>
</div>
<div style={{display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px"}}>
{v.themeOpts.map((t, $index) => (<React.Fragment key={$index}>
<button onClick={t.pick} aria-pressed={t.on} aria-label={"Theme: " + t.name} style={{display: "flex", alignItems: "center", gap: "12px", border: "none", borderRadius: "16px", padding: "10px 12px", background: "rgba(255,255,255,0.85)", boxShadow: t.ring, color: "var(--ink)", textAlign: "left"}}>
<span style={{flex: "0 0 auto", width: "36px", height: "36px", borderRadius: "50%", background: t.swatch, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)"}}></span>
<span style={{flex: "1", fontSize: "16px", fontWeight: "500"}}>{t.name}</span>
{t.on && (<><span aria-hidden="true" style={{fontSize: "15px"}}>✓</span></>)}
</button>
</React.Fragment>))}
</div>
</div>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
<span style={{fontSize: "20px", fontWeight: "600"}}>My badges</span>
<span style={{fontSize: "14px", color: "var(--muted)"}}>3 of 12 earned</span>
</div>
<div style={{background: "rgba(255,255,255,0.7)", borderRadius: "26px", padding: "16px 10px", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "6px"}}>
<div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center"}}>
<span style={{width: "68px", height: "68px", borderRadius: "50%", background: "linear-gradient(140deg, #FFFFFF, #E3E0F8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(120,100,170,0.18)"}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5.5h16v11H9l-5 4v-15Z"></path></svg></span>
<span style={{fontSize: "14px", fontWeight: "600", lineHeight: "1.2"}}>First Hello</span>
<span style={{fontSize: "12px", color: "var(--muted)", lineHeight: "1.2"}}>Said hi</span>
</div>
<div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center"}}>
<span style={{width: "68px", height: "68px", borderRadius: "50%", background: "linear-gradient(140deg, #FCE7EC, #F7C9D4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(120,100,170,0.18)"}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 5.7c-2-2-5.2-2-7.2 0L12 7.3l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8.1a5.1 5.1 0 0 0 0-7.2Z"></path></svg></span>
<span style={{fontSize: "14px", fontWeight: "600", lineHeight: "1.2"}}>Kind Words</span>
<span style={{fontSize: "12px", color: "var(--muted)", lineHeight: "1.2"}}>Disagreed gently</span>
</div>
<div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center"}}>
<span style={{width: "68px", height: "68px", borderRadius: "50%", background: "linear-gradient(140deg, #EEECFB, #D3CDF6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(120,100,170,0.18)"}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{stroke: "var(--ink)"}} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h11a3 3 0 1 0-3-3"></path><path d="M3 12h15a3 3 0 1 1-3 3"></path><path d="M3 16h7"></path></svg></span>
<span style={{fontSize: "14px", fontWeight: "600", lineHeight: "1.2"}}>Breather</span>
<span style={{fontSize: "12px", color: "var(--muted)", lineHeight: "1.2"}}>Took a pause</span>
</div>
<div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center"}}>
<span style={{width: "68px", height: "68px", borderRadius: "50%", background: "#EEEAF3", border: "1.5px dashed #B9B0CB", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center"}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8C83A0" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></span>
<span style={{fontSize: "14px", fontWeight: "600", lineHeight: "1.2", color: "var(--muted)"}}>Game Night</span>
<span style={{fontSize: "12px", color: "var(--muted)", lineHeight: "1.2"}}>Go on Friday</span>
</div>
</div>
</div>
<div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
<span style={{fontSize: "20px", fontWeight: "600"}}>My support circle</span>
<div style={{background: "rgba(255,255,255,0.85)", borderRadius: "26px", padding: "4px 16px"}}>
<div style={{minHeight: "68px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #EAE3F3"}}>
<div style={{flex: "1", display: "flex", flexDirection: "column"}}><span style={{fontSize: "17px", fontWeight: "500"}}>Mom</span><span style={{fontSize: "14px", color: "var(--muted)"}}>Gets my "I need help" texts</span></div></div>
{v.mariaConnected && (<>
<div style={{minHeight: "68px", display: "flex", alignItems: "center", gap: "12px"}}>
<div style={{flex: "1", display: "flex", flexDirection: "column"}}><span style={{fontSize: "17px", fontWeight: "500"}}>Coach Maria</span><span style={{fontSize: "14px", color: "var(--muted)"}}>{v.mariaSees}</span></div></div>
</>)}
</div>
<span style={{fontSize: "14px", color: "var(--muted)", textAlign: "center"}}>Your chats stay private. You choose what they see.</span>
</div>
<div style={{background: "rgba(255,255,255,0.55)", borderRadius: "20px", padding: "14px 16px", fontSize: "15px", textAlign: "center"}}>Mo isn't a therapist. Need help now? Call or text 988.</div>
</div>
</>)}

</div>

{v.showTabs && (<>
{v.showMoMenu && (<>
<div className="rise" style={{position: "absolute", right: "16px", bottom: "96px", width: "260px", background: "rgba(255,255,255,0.97)", borderRadius: "26px", padding: "10px", boxSizing: "border-box", boxShadow: "0 20px 50px rgba(120,100,170,0.28)", display: "flex", flexDirection: "column", gap: "6px", zIndex: "5"}}>
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
<button onClick={v.goHome} aria-label="Home" style={{height: "52px", width: "96px", padding: "0", borderRadius: "26px", border: "none", background: v.homeBg, color: v.homeFg, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", fontWeight: "600"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{stroke: v.homeFg}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8"></path><path d="M5.5 9.5V21h13V9.5"></path></svg>
{v.tabIsHome && (<><span>Home</span></>)}
</button>
<button onClick={v.goCircles} aria-label="Circles" style={{height: "52px", width: "96px", padding: "0", borderRadius: "26px", border: "none", background: v.circlesBg, color: v.circlesFg, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", fontWeight: "600"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{stroke: v.circlesFg}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="9" r="3"></circle><circle cx="16" cy="9" r="3"></circle><path d="M2.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 15.3c.8-.2 1.6-.3 2.5-.3 3 0 5 1.5 5.5 5"></path></svg>
{v.tabIsCircles && (<><span>Circles</span></>)}
</button>
<button onClick={v.goMe} aria-label="Me" style={{height: "52px", width: "96px", padding: "0", borderRadius: "26px", border: "none", background: v.meBg, color: v.meFg, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", fontWeight: "600"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{stroke: v.meFg}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4.5 21c.8-4 3.3-6 7.5-6s6.7 2 7.5 6"></path></svg>
{v.tabIsMe && (<><span>Me</span></>)}
</button>
<button onClick={v.toggleMo} aria-label="Open Mo" aria-expanded={v.moOpen} style={{width: "52px", height: "52px", borderRadius: "50%", border: "none", background: v.moBtnBg, display: "flex", alignItems: "center", justifyContent: "center", padding: "0"}}>
<Mo mood={v.floatMood} size={42} />
</button>
</nav>
</div>
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
