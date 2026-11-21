<!-- English privacy notice. Keep in sync with PrivacyDe.svelte, which is the legally relevant version for German readers. -->
<h1>Privacy notice</h1>
<p class="updated">Last updated: 21 November 2026</p>

<h2>Controller</h2>
<p>
  LukeZ Development by Luca Hentschel, Schneeberger Str. 31, 08112 Wilkau-Haßlau, Germany. Email:
  <a href="mailto:hello@thelukez.com">hello@thelukez.com</a>. There is no data protection officer.
</p>

<h2>Hosting</h2>
<p>
  This site runs on Cloudflare Workers by Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA. To
  deliver a page, Cloudflare necessarily processes your IP address and the technical data your browser sends
  (requested URL, time, user agent, language). This site does not keep its own access logs. Cloudflare acts as
  my processor under a data processing agreement and is certified under the EU-US Data Privacy Framework.
  Legal basis: Art. 6(1)(f) GDPR, my legitimate interest in running a secure, working website.
</p>
<p>
  The page language is chosen from the URL or your browser's language setting. No cookie is set for this.
  Fonts are served from this site, not from a third party.
</p>

<h2>Liking feed posts</h2>
<p>
  You can like posts in the feed without an account. Nothing below happens until you click the like button.
</p>
<ul>
  <li>
    <strong>Bot check:</strong> on your first like, your browser loads Cloudflare Turnstile from
    <code>challenges.cloudflare.com</code>. Turnstile checks technical signals from your browser and device to
    tell people from bots, and the resulting token is verified with Cloudflare together with your IP address.
    Usually you see nothing; sometimes Turnstile asks you to click a checkbox.
  </li>
  <li>
    <strong>Device cookie:</strong> after a passed check, I set the cookie <code>feed_device</code>. It holds
    a random ID with a signature, is only sent to <code>/api/feed/likes</code> and expires after one year (each
    like renews it). It lets you like each post only once and spares you further checks.
  </li>
  <li>
    <strong>Stored like:</strong> for each like I store the post, the random device ID, the date and a keyed hash
    of your IP address. The hash changes every day and cannot be turned back into your IP address; it only limits
    how many likes one network can give a post per day. Your IP address itself is not stored. The entry is deleted
    when you remove your like.
  </li>
</ul>
<p>
  Legal basis: the cookie and the bot check are strictly necessary for the like feature you asked for (Section
  25(2) no. 2 TDDDG). The processing is based on Art. 6(1)(f) GDPR, my legitimate interest in fair like counts
  without bots. You can delete the cookie in your browser at any time; a like you gave stays counted unless
  you remove it first.
</p>

<h2>Discord permissions calculator</h2>
<p>
  If you enter an application ID in the <a href="/discord-permissions">permissions calculator</a>, it is saved
  in your browser's local storage so the field is filled next time. It never leaves your device. You can clear
  it by emptying the field or your browser storage. Legal basis: Section 25(2) no. 2 TDDDG.
</p>

<h2>CMS sign-in</h2>
<p>
  The <code>/admin</code> area is only for me. Signing in there uses GitHub OAuth and a short-lived cookie (10 minutes)
  that protects the sign-in. Visitors are not affected.
</p>

<h2>Links to other sites</h2>
<p>
  This site links to other services such as GitHub, Discord and Ko-fi. Nothing is loaded from them until you
  follow a link; after that, their privacy policies apply.
</p>

<h2>Your rights</h2>
<p>
  You have the right to access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of
  processing (Art. 18), data portability (Art. 20) and to object to processing based on legitimate interests
  (Art. 21). Write to <a href="mailto:hello@thelukez.com">hello@thelukez.com</a>. Note that I can only find a
  like if you tell me the post and can show the device cookie, because I do not know who you are.
</p>
<p>
  You can also complain to a supervisory authority, for example the one responsible for me: Sächsische
  Datenschutz- und Transparenzbeauftragte, Devrientstraße 5, 01067 Dresden, Germany.
</p>
