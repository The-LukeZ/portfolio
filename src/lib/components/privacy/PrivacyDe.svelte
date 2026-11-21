<!-- Deutsche Datenschutzerklärung. Mit PrivacyEn.svelte synchron halten. -->
<h1>Datenschutzerklärung</h1>
<p class="updated">Stand: 21. November 2026</p>

<h2>Verantwortlicher</h2>
<p>
  LukeZ Development by Luca Hentschel, Schneeberger Str. 31, 08112 Wilkau-Haßlau, Deutschland. E-Mail:
  <a href="mailto:hello@thelukez.com">hello@thelukez.com</a>. Ein Datenschutzbeauftragter ist nicht benannt.
</p>

<h2>Hosting</h2>
<p>
  Diese Website läuft auf Cloudflare Workers der Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107,
  USA. Um eine Seite auszuliefern, verarbeitet Cloudflare zwangsläufig deine IP-Adresse und die technischen
  Daten, die dein Browser sendet (aufgerufene URL, Zeitpunkt, User-Agent, Sprache). Eigene Zugriffsprotokolle
  führt diese Website nicht. Cloudflare ist mein Auftragsverarbeiter auf Grundlage eines
  Auftragsverarbeitungsvertrags und nach dem EU-US Data Privacy Framework zertifiziert. Rechtsgrundlage: Art.
  6 Abs. 1 lit. f DSGVO, mein berechtigtes Interesse an einer sicheren, funktionierenden Website.
</p>
<p>
  Die Sprache der Seite ergibt sich aus der URL oder der Spracheinstellung deines Browsers. Dafür wird kein
  Cookie gesetzt. Schriftarten werden von dieser Website ausgeliefert, nicht von Dritten.
</p>

<h2>Likes im Feed</h2>
<p>
  Du kannst Beiträge im Feed ohne Konto liken. Nichts davon passiert, bevor du auf den Like-Button klickst.
</p>
<ul>
  <li>
    <strong>Bot-Prüfung:</strong> Beim ersten Like lädt dein Browser Cloudflare Turnstile von
    <code>challenges.cloudflare.com</code>. Turnstile prüft technische Merkmale deines Browsers und Geräts, um
    Menschen von Bots zu unterscheiden. Das Ergebnis wird zusammen mit deiner IP-Adresse bei Cloudflare
    überprüft. Meist siehst du davon nichts; manchmal bittet Turnstile dich, ein Kästchen anzuklicken.
  </li>
  <li>
    <strong>Geräte-Cookie:</strong> Nach bestandener Prüfung setze ich das Cookie <code>feed_device</code>. Es
    enthält eine zufällige ID mit Signatur, wird nur an <code>/api/feed/likes</code> gesendet und läuft nach einem
    Jahr ab (jedes Like verlängert es). Damit kannst du jeden Beitrag nur einmal liken und musst nicht erneut geprüft
    werden.
  </li>
  <li>
    <strong>Gespeichertes Like:</strong> Pro Like speichere ich den Beitrag, die zufällige Geräte-ID, das Datum
    und einen mit Schlüssel gebildeten Hash deiner IP-Adresse. Der Hash ändert sich täglich und lässt sich nicht
    in deine IP-Adresse zurückrechnen; er begrenzt nur, wie viele Likes ein Netzwerk einem Beitrag pro Tag geben
    kann. Deine IP-Adresse selbst wird nicht gespeichert. Der Eintrag wird gelöscht, wenn du dein Like entfernst.
  </li>
</ul>
<p>
  Rechtsgrundlage: Das Cookie und die Bot-Prüfung sind für die von dir gewünschte Like-Funktion unbedingt
  erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Die Verarbeitung stützt sich auf Art. 6 Abs. 1 lit. f DSGVO, mein
  berechtigtes Interesse an fairen Like-Zahlen ohne Bots. Du kannst das Cookie jederzeit in deinem Browser
  löschen; ein abgegebenes Like bleibt gezählt, wenn du es nicht vorher entfernst.
</p>

<h2>Discord-Berechtigungsrechner</h2>
<p>
  Wenn du im <a href="/de/discord-permissions">Berechtigungsrechner</a> eine Application-ID eingibst, wird sie im
  lokalen Speicher deines Browsers gesichert, damit das Feld beim nächsten Mal ausgefüllt ist. Sie verlässt dein
  Gerät nie. Du kannst sie löschen, indem du das Feld oder deinen Browserspeicher leerst. Rechtsgrundlage: § 25
  Abs. 2 Nr. 2 TDDDG.
</p>

<h2>CMS-Anmeldung</h2>
<p>
  Der Bereich <code>/admin</code> ist nur für mich. Die Anmeldung dort nutzt GitHub OAuth und ein kurzlebiges Cookie
  (10 Minuten), das den Anmeldevorgang absichert. Besucher sind davon nicht betroffen.
</p>

<h2>Links zu anderen Websites</h2>
<p>
  Diese Website verlinkt auf andere Dienste wie GitHub, Discord und Ko-fi. Von dort wird nichts geladen, bevor
  du einem Link folgst; danach gelten deren Datenschutzerklärungen.
</p>

<h2>Deine Rechte</h2>
<p>
  Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung
  der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und auf Widerspruch gegen Verarbeitungen aufgrund
  berechtigter Interessen (Art. 21). Schreib an <a href="mailto:hello@thelukez.com">hello@thelukez.com</a>.
  Ein Like kann ich nur finden, wenn du mir den Beitrag nennst und das Geräte-Cookie zeigen kannst, weil ich
  nicht weiß, wer du bist.
</p>
<p>
  Außerdem kannst du dich bei einer Aufsichtsbehörde beschweren, zum Beispiel bei der für mich zuständigen:
  Sächsische Datenschutz- und Transparenzbeauftragte, Devrientstraße 5, 01067 Dresden.
</p>
