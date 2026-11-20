<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, reactive, ref, watch } from "vue";
import {
  buildSignatureDocument,
  buildSignatureHtml,
  buildSignaturePlainText,
  createDefaultSignatureConfig,
  normalizeImageUrl,
  normalizeWebUrl,
  type SignatureConfig,
  type SignatureLayout,
  type SignatureTheme
} from "../../signature/emailSignature";

type EditorTab = "identity" | "design" | "details";
type PreviewSurface = "light" | "dark";

const STORAGE_KEY = "vireon.signature-studio.v1";
const form = reactive<SignatureConfig>(createDefaultSignatureConfig());
const activeTab = ref<EditorTab>("identity");
const previewSurface = ref<PreviewSurface>("light");
const saveStatus = ref("Saved only on this device");
const actionStatus = ref("");
const actionKind = ref<"success" | "error" | "info">("info");
const isHydrating = true;
let localHydrating = isHydrating;

const signatureHtml = computed(() => buildSignatureHtml(form));
const plainText = computed(() => buildSignaturePlainText(form));
const hasName = computed(() => form.name.trim().length > 0);
const emailInvalid = computed(() => form.email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()));
const currentTemplate = computed(() => ({
  portrait: "Portrait",
  brand: "Brand mark",
  minimal: "Minimal"
}[form.layout]));
const initials = computed(() => {
  const parts = form.name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.length ? parts.map((part) => Array.from(part)[0]?.toUpperCase() ?? "").join("") : "YN";
});
const imageWarnings = computed(() => {
  const warnings: string[] = [];
  if (form.logoUrl.trim() && !normalizeImageUrl(form.logoUrl)) {
    warnings.push("The logo was not included because its address must be a public HTTPS image URL.");
  }
  if (form.portraitUrl.trim() && !normalizeImageUrl(form.portraitUrl)) {
    warnings.push("The portrait was not included because its address must be a public HTTPS image URL.");
  }
  return warnings;
});
const ctaInvalid = computed(() => Boolean(form.ctaLabel.trim()) && !normalizeWebUrl(form.ctaUrl));
const websiteInvalid = computed(() => Boolean(form.website.trim()) && !normalizeWebUrl(form.website));

function restoreDraft() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return;
    const defaults = createDefaultSignatureConfig();
    const values = parsed as Record<string, unknown>;
    (Object.keys(defaults) as (keyof SignatureConfig)[]).forEach((key) => {
      if (typeof values[key] === typeof defaults[key]) {
        Object.assign(form, { [key]: values[key] });
      }
    });
    saveStatus.value = "Draft restored from this device";
  } catch {
    saveStatus.value = "Local draft unavailable";
  }
}

watch(form, () => {
  if (localHydrating) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    saveStatus.value = "Saved on this device";
  } catch {
    saveStatus.value = "Local storage is unavailable";
  }
}, { deep: true });

onMounted(() => {
  restoreDraft();
  localHydrating = false;
});

onBeforeUnmount(() => {
  localHydrating = true;
});

function chooseLayout(layout: SignatureLayout) {
  form.layout = layout;
  actionStatus.value = "";
}

function chooseTheme(theme: SignatureTheme) {
  form.theme = theme;
  actionStatus.value = "";
}

function resetDraft() {
  Object.assign(form, createDefaultSignatureConfig());
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    saveStatus.value = "Draft reset";
  } catch {
    saveStatus.value = "Draft reset for this session";
  }
  actionStatus.value = "Your signature has been reset.";
  actionKind.value = "info";
}

function validateBeforeCopy(): boolean {
  if (!hasName.value) {
    actionStatus.value = "Add your name in Identity before copying your signature.";
    actionKind.value = "error";
    document.getElementById("signature-name")?.focus();
    activeTab.value = "identity";
    return false;
  }
  if (emailInvalid.value) {
    actionStatus.value = "Check the email address format before copying.";
    actionKind.value = "error";
    activeTab.value = "details";
    document.getElementById("signature-email")?.focus();
    return false;
  }
  return true;
}

function fallbackCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.append(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  textarea.remove();
  return copied;
}

function fallbackCopyRich(html: string): boolean {
  const container = document.createElement("div");
  container.contentEditable = "true";
  container.setAttribute("aria-hidden", "true");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "560px";
  container.innerHTML = html;
  document.body.append(container);
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(container);
  selection?.removeAllRanges();
  selection?.addRange(range);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  selection?.removeAllRanges();
  container.remove();
  return copied;
}

async function copySignature() {
  if (!validateBeforeCopy()) return;
  actionStatus.value = "";
  try {
    if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
      const item = new ClipboardItem({
        "text/html": new Blob([signatureHtml.value], { type: "text/html" }),
        "text/plain": new Blob([plainText.value], { type: "text/plain" })
      });
      await navigator.clipboard.write([item]);
    } else if (!fallbackCopyRich(signatureHtml.value)) {
      throw new Error("Rich clipboard access is unavailable.");
    }
    actionStatus.value = "Signature copied. Paste it into your email signature settings.";
    actionKind.value = "success";
  } catch {
    actionStatus.value = "This browser blocked rich copying. Use Copy HTML or select the preview and copy it manually.";
    actionKind.value = "error";
  }
}

async function copyHtml() {
  if (!validateBeforeCopy()) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(signatureHtml.value);
    } else if (!fallbackCopy(signatureHtml.value)) {
      throw new Error("Clipboard access is unavailable.");
    }
    actionStatus.value = "Email-safe HTML copied.";
    actionKind.value = "success";
  } catch {
    actionStatus.value = "The browser blocked clipboard access. Use Export HTML instead.";
    actionKind.value = "error";
  }
}

function exportHtml() {
  if (!validateBeforeCopy()) return;
  const file = new Blob([buildSignatureDocument(form)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "email-signature.html";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  actionStatus.value = "HTML file exported.";
  actionKind.value = "success";
}
</script>

<template>
  <div class="signature-app">
    <header class="signature-header">
      <a class="signature-wordmark" href="/" aria-label="Vireon Noctis home">
        <img src="/vireon-mark.svg" alt="" width="25" height="25" />
        <span>VIREON <i>/</i> NOCTIS</span>
      </a>
      <div class="signature-header-center">TOOLS <span>/</span> EMAIL IDENTITY</div>
      <a class="signature-back-link" href="/">PORTFOLIO <span aria-hidden="true">↗</span></a>
    </header>

    <main class="signature-main">
      <section class="signature-intro">
        <div class="signature-eyebrow"><span class="signature-live-dot"></span> SIGNATURE STUDIO <span class="signature-index">/ 001</span></div>
        <div class="signature-intro-layout">
          <div>
            <h1>Leave a <span>lasting</span><br />impression.</h1>
            <p class="signature-intro-copy">A considered signature for every message. Shape the details, refine the layout, then export clean HTML made for email.</p>
          </div>
          <div class="signature-intro-aside">
            <span>DESIGN SYSTEM</span>
            <strong>01 — 03</strong>
            <small>CONFIGURE / PREVIEW / EXPORT</small>
          </div>
        </div>
        <div class="signature-heading-rule"><span>PERSONAL IDENTITY</span><span>LIVE HTML RENDER</span><span>NO ACCOUNT REQUIRED</span></div>
      </section>

      <div class="signature-workspace">
        <section class="signature-editor" aria-label="Signature editor">
          <div class="signature-panel-heading">
            <div><span class="signature-overline">01 / CONFIGURE</span><h2>Build your signature</h2></div>
            <span class="signature-save-state"><span></span>{{ saveStatus }}</span>
          </div>

          <div class="signature-tabs" role="tablist" aria-label="Signature settings">
            <button type="button" role="tab" :aria-selected="activeTab === 'identity'" :class="{ 'is-active': activeTab === 'identity' }" @click="activeTab = 'identity'">Identity <span>01</span></button>
            <button type="button" role="tab" :aria-selected="activeTab === 'design'" :class="{ 'is-active': activeTab === 'design' }" @click="activeTab = 'design'">Design <span>02</span></button>
            <button type="button" role="tab" :aria-selected="activeTab === 'details'" :class="{ 'is-active': activeTab === 'details' }" @click="activeTab = 'details'">Details <span>03</span></button>
          </div>

          <div v-if="activeTab === 'identity'" class="signature-fields" role="tabpanel">
            <div class="signature-field-grid">
              <label class="signature-field signature-field-wide" for="signature-name">
                <span>Full name <b>REQUIRED</b></span>
                <input id="signature-name" v-model="form.name" autocomplete="name" maxlength="80" placeholder="Your full name" />
              </label>
              <label class="signature-field" for="signature-role">
                <span>Position / role</span>
                <input id="signature-role" v-model="form.role" autocomplete="organization-title" maxlength="80" placeholder="Creative Director" />
              </label>
              <label class="signature-field" for="signature-company">
                <span>Company</span>
                <input id="signature-company" v-model="form.company" autocomplete="organization" maxlength="80" placeholder="Company or studio" />
              </label>
              <div class="signature-field signature-field-wide">
                <span>Logo image <small>OPTIONAL</small></span>
                <input v-model="form.logoUrl" type="url" inputmode="url" placeholder="https://example.com/logo.png" aria-label="Public HTTPS logo image URL" />
                <small class="signature-field-help">Use a publicly accessible HTTPS PNG or JPEG. Local files cannot be embedded reliably in email.</small>
              </div>
              <div class="signature-field signature-field-wide">
                <span>Portrait image <small>OPTIONAL</small></span>
                <input v-model="form.portraitUrl" type="url" inputmode="url" placeholder="https://example.com/portrait.jpg" aria-label="Public HTTPS portrait image URL" />
                <small class="signature-field-help">Remote images may be hidden until a recipient allows images. The signature remains readable without them.</small>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'design'" class="signature-fields" role="tabpanel">
            <div class="signature-control-group">
              <div class="signature-control-heading"><span>LAYOUT</span><small>CHOOSE A STRUCTURE</small></div>
              <div class="signature-layout-options">
                <button type="button" :aria-pressed="form.layout === 'portrait'" :class="{ 'is-selected': form.layout === 'portrait' }" @click="chooseLayout('portrait')">
                  <span class="layout-sample layout-sample-portrait"><i></i><b></b><em></em></span>
                  <strong>Portrait</strong><small>Photo-led</small>
                </button>
                <button type="button" :aria-pressed="form.layout === 'brand'" :class="{ 'is-selected': form.layout === 'brand' }" @click="chooseLayout('brand')">
                  <span class="layout-sample layout-sample-brand"><i></i><b></b><em></em></span>
                  <strong>Brand mark</strong><small>Identity-led</small>
                </button>
                <button type="button" :aria-pressed="form.layout === 'minimal'" :class="{ 'is-selected': form.layout === 'minimal' }" @click="chooseLayout('minimal')">
                  <span class="layout-sample layout-sample-minimal"><i></i><b></b><em></em></span>
                  <strong>Minimal</strong><small>Type-led</small>
                </button>
              </div>
            </div>

            <div class="signature-control-group">
              <div class="signature-control-heading"><span>COLOUR MODE</span><small>EMAIL-SAFE PALETTE</small></div>
              <div class="signature-theme-options">
                <button type="button" :aria-pressed="form.theme === 'ink'" :class="{ 'is-selected': form.theme === 'ink' }" @click="chooseTheme('ink')"><i class="theme-swatch theme-swatch-ink"></i><span><strong>Ink</strong><small>Dark surface</small></span><b>✓</b></button>
                <button type="button" :aria-pressed="form.theme === 'paper'" :class="{ 'is-selected': form.theme === 'paper' }" @click="chooseTheme('paper')"><i class="theme-swatch theme-swatch-paper"></i><span><strong>Paper</strong><small>Light surface</small></span><b>✓</b></button>
              </div>
            </div>

            <div class="signature-field-grid">
              <label class="signature-field" for="signature-accent">
                <span>Accent colour</span>
                <div class="signature-colour-input"><input id="signature-accent" v-model="form.accent" type="color" /><code>{{ form.accent.toUpperCase() }}</code></div>
              </label>
              <label class="signature-field" for="signature-tagline">
                <span>Short statement <small>OPTIONAL</small></span>
                <input id="signature-tagline" v-model="form.tagline" maxlength="120" placeholder="A short line about your work" />
              </label>
            </div>
          </div>

          <div v-else class="signature-fields" role="tabpanel">
            <div class="signature-field-grid">
              <label class="signature-field signature-field-wide" for="signature-email">
                <span>Email address</span>
                <input id="signature-email" v-model="form.email" type="email" autocomplete="email" maxlength="120" placeholder="you@example.com" :aria-invalid="emailInvalid" />
                <small v-if="emailInvalid" class="signature-inline-error">Enter a valid email address.</small>
              </label>
              <label class="signature-field" for="signature-phone">
                <span>Phone number</span>
                <input id="signature-phone" v-model="form.phone" type="tel" autocomplete="tel" maxlength="40" placeholder="+353 00 000 0000" />
              </label>
              <label class="signature-field" for="signature-website">
                <span>Website</span>
                <input id="signature-website" v-model="form.website" type="url" inputmode="url" maxlength="180" placeholder="yourwebsite.com" :aria-invalid="websiteInvalid" />
                <small v-if="websiteInvalid" class="signature-inline-error">Enter a valid website address.</small>
              </label>
              <label class="signature-field signature-field-wide" for="signature-location">
                <span>Location <small>OPTIONAL</small></span>
                <input id="signature-location" v-model="form.location" autocomplete="address-level2" maxlength="100" placeholder="Dublin, Ireland" />
              </label>
            </div>

            <div class="signature-control-group signature-toggles">
              <div class="signature-control-heading"><span>SHOW IN SIGNATURE</span><small>OPTIONAL DETAILS</small></div>
              <label><input v-model="form.showCompany" type="checkbox" /> Company name</label>
              <label><input v-model="form.showPhone" type="checkbox" /> Phone number</label>
              <label><input v-model="form.showLocation" type="checkbox" /> Location</label>
              <label><input v-model="form.showSocials" type="checkbox" /> Social links</label>
            </div>

            <div class="signature-control-group">
              <div class="signature-control-heading"><span>SOCIAL LINKS</span><small>ONLY VALID LINKS ARE INCLUDED</small></div>
              <div class="signature-field-grid">
                <label class="signature-field" for="signature-linkedin"><span>LinkedIn</span><input id="signature-linkedin" v-model="form.linkedinUrl" type="url" inputmode="url" placeholder="https://linkedin.com/in/..." /></label>
                <label class="signature-field" for="signature-instagram"><span>Instagram</span><input id="signature-instagram" v-model="form.instagramUrl" type="url" inputmode="url" placeholder="https://instagram.com/..." /></label>
                <label class="signature-field signature-field-wide" for="signature-x"><span>X / other profile</span><input id="signature-x" v-model="form.xUrl" type="url" inputmode="url" placeholder="https://x.com/..." /></label>
              </div>
            </div>

            <div class="signature-control-group">
              <div class="signature-control-heading"><span>CALL TO ACTION</span><small>OPTIONAL LINK</small></div>
              <div class="signature-field-grid">
                <label class="signature-field" for="signature-cta-label"><span>Button text</span><input id="signature-cta-label" v-model="form.ctaLabel" maxlength="36" placeholder="Schedule a call" /></label>
                <label class="signature-field" for="signature-cta-url"><span>Button destination</span><input id="signature-cta-url" v-model="form.ctaUrl" type="url" inputmode="url" placeholder="https://..." /></label>
              </div>
              <small v-if="ctaInvalid" class="signature-inline-error">Add a valid HTTPS or HTTP destination for this button.</small>
            </div>
          </div>

          <div class="signature-editor-footer">
            <span>YOUR DRAFT STAYS IN THIS BROWSER</span>
            <button type="button" class="signature-reset-button" @click="resetDraft">Reset fields <span aria-hidden="true">↺</span></button>
          </div>
        </section>

        <section class="signature-output" aria-label="Live signature preview">
          <div class="signature-output-heading">
            <div><span class="signature-overline">02 / PREVIEW</span><h2>See it in context</h2></div>
            <div class="signature-preview-switch" aria-label="Preview background">
              <button type="button" :aria-pressed="previewSurface === 'light'" :class="{ 'is-active': previewSurface === 'light' }" @click="previewSurface = 'light'">Light</button>
              <button type="button" :aria-pressed="previewSurface === 'dark'" :class="{ 'is-active': previewSurface === 'dark' }" @click="previewSurface = 'dark'">Dark</button>
            </div>
          </div>

          <div class="signature-mail-window" :class="'preview-' + previewSurface">
            <div class="signature-mail-toolbar">
              <div class="signature-mail-dots"><i></i><i></i><i></i></div>
              <span>NEW MESSAGE</span>
              <span>↗</span>
            </div>
            <div class="signature-mail-fields">
              <div><span>TO</span> someone@example.com</div>
              <div><span>SUBJECT</span> A quick introduction</div>
            </div>
            <div class="signature-mail-body">
              <p>Hello,</p>
              <p>Looking forward to connecting.</p>
              <div class="signature-rendered" v-html="signatureHtml"></div>
              <span class="signature-cursor" aria-hidden="true"></span>
            </div>
          </div>

          <div class="signature-preview-meta"><span>{{ currentTemplate }} / {{ form.theme === "ink" ? "INK" : "PAPER" }}</span><span>560 PX MAX / RESPONSIVE WIDTH</span></div>

          <div v-if="imageWarnings.length || websiteInvalid || ctaInvalid" class="signature-warning-list" role="status">
            <p v-for="warning in imageWarnings" :key="warning">{{ warning }}</p>
            <p v-if="websiteInvalid">The website link is omitted until you enter a valid address.</p>
            <p v-if="ctaInvalid">The call-to-action button is omitted until its destination is valid.</p>
          </div>

          <div class="signature-export">
            <div class="signature-export-heading"><div><span class="signature-overline">03 / EXPORT</span><h3>Ready when you are.</h3></div><span>HTML / RICH TEXT</span></div>
            <div class="signature-export-actions">
              <button type="button" class="signature-copy-primary" @click="copySignature"><span>Copy signature</span><span aria-hidden="true">↗</span></button>
              <button type="button" class="signature-copy-secondary" @click="copyHtml">Copy HTML</button>
              <button type="button" class="signature-copy-secondary" @click="exportHtml">Export .html</button>
            </div>
            <p class="signature-action-status" :class="'is-' + actionKind" aria-live="polite" role="status">{{ actionStatus || "Rich copy preserves formatting where the email client allows it." }}</p>
          </div>
        </section>
      </div>

      <section class="signature-compatibility">
        <div class="signature-compatibility-heading">
          <div><span class="signature-overline">COMPATIBILITY / 04</span><h2>Made for the <em>real inbox.</em></h2></div>
          <p>Clean markup first. Effects are optional; readable identity is not.</p>
        </div>
        <div class="signature-client-grid">
          <article><span>01</span><h3>Gmail</h3><p>Copy the rendered signature and paste it into the signature editor in Settings.</p></article>
          <article><span>02</span><h3>Proton Mail</h3><p>Paste the formatted signature into Settings → Identity and addresses → Display name and signature.</p><a href="https://proton.me/support/display-name-email-signature" target="_blank" rel="noopener noreferrer">Proton setup guide ↗</a></article>
          <article><span>03</span><h3>Outlook</h3><p>Uses nested tables, explicit dimensions and inline styles for older Word-based rendering.</p></article>
          <article><span>04</span><h3>Apple Mail</h3><p>Use Copy signature to transfer the formatted block into your signature preferences.</p></article>
          <article><span>05</span><h3>Thunderbird</h3><p>Use the HTML export as a signature file or paste the rich version in settings.</p></article>
          <article><span>06</span><h3>Cloudflare</h3><p>For Email Service outbound messages, place the HTML in the message’s HTML body. Email Routing only forwards incoming mail.</p><a href="https://developers.cloudflare.com/email-service/get-started/send-emails/" target="_blank" rel="noopener noreferrer">Cloudflare sending guide ↗</a></article>
        </div>
        <div class="signature-compatibility-foot"><span>TABLE LAYOUTS</span><span>INLINE STYLES</span><span>NO EXTERNAL FONTS</span><span>HTTPS IMAGES</span><span>PLAIN-TEXT FALLBACK</span></div>
        <p class="signature-compatibility-note">Email clients can rewrite HTML, block remote images or apply their own dark-mode rules. This builder avoids fragile effects in the exported signature, but no third-party builder can guarantee pixel-identical rendering in every inbox.</p>
      </section>

      <footer class="signature-footer">
        <a class="signature-wordmark" href="/"><img src="/vireon-mark.svg" alt="" width="22" height="22" /><span>VIREON <i>/</i> NOCTIS</span></a>
        <span>DESIGNED TO SIGN OFF.</span>
        <a href="/">RETURN TO PORTFOLIO ↑</a>
      </footer>
    </main>
  </div>
</template>
