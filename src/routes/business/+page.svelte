<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import { getLocale, localizeHref, setLocale, type Locale } from "$lib/paraglide/runtime";
</script>

<svelte:head>
  <title>LukeZ Development by Luca Hentschel</title>
</svelte:head>

<!-- Navigation -->
<nav class="nav no-select">
  <div class="nav-container">
    <a href={localizeHref("/")} class="logo font-inter">LukeZ</a>

    <ul class="nav-links">
      <li>
        <select
          id="language-select"
          aria-label="Select Language"
          class="language-select"
          onchange={(e) => {
            const lang = e.currentTarget.value;
            setLocale(lang as Locale, { reload: true });
          }}
        >
          <option value="en" selected={getLocale() === "en"}>English</option>
          <option value="de" selected={getLocale() === "de"}>Deutsch</option>
        </select>
      </li>
    </ul>
  </div>
</nav>

<main class="business-page">
  <!-- About Section -->
  <section class="section business-about">
    <div class="business-container">
      <h1 class="business-title">LukeZ Development by Luca Hentschel</h1>
      <p class="business-subtitle">{m["business.subtitle"]()}</p>

      <div class="business-info">
        <p>{@html m["business.description"]()}</p>
        <p>{@html m["business.projectsText"]({ projectsLink: localizeHref("/#projects") })}</p>
      </div>
    </div>
  </section>

  <!-- Imprint Section -->
  <section class="section business-imprint">
    <div class="business-container">
      <div class="imprint-content">
        <h3>{m["business.imprint.title"]()}</h3>
        <p>
          LukeZ Development by Luca Hentschel<br />
          Schneeberger Str. 31<br />
          08112 Wilkau-Haßlau<br />
          Germany<br />
          <small>{m["business.imprint.noPackages"]()}</small>
        </p>

        <p>{m["business.imprint.vatLabel"]({ vatId: "DE457982866" })}</p>

        <h3>{m["business.imprint.contactTitle"]()}</h3>
        <p>
          {m["business.imprint.emailLabel"]({ email: "contact.lukez@proton.me" })}
        </p>
      </div>
    </div>
  </section>
</main>

<!-- Footer -->
<footer class="footer">
  <p>{@html m.footer()}</p>
</footer>
