<script setup lang="ts">
</script>

<template>
<Teleport to="body">
    <div class="intro-loader" aria-hidden="true">
      <div class="intro-loader-grain"></div>
      <div class="intro-loader-field-lines"></div>
      <svg class="intro-loader-wavefield" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1" vector-effect="non-scaling-stroke">
          <path d="M-90 205 C 110 70 230 325 430 218 S 690 88 850 192" />
          <path d="M-120 236 C 95 120 242 363 448 254 S 690 128 840 226" />
          <path d="M-130 270 C 105 160 250 395 470 290 S 695 166 830 264" />
          <path d="M-110 690 C 92 560 244 802 446 694 S 682 568 840 670" />
          <path d="M-130 724 C 95 592 256 842 462 730 S 700 600 858 704" />
          <path d="M760 190 C 940 75 1105 315 1290 208 S 1510 95 1695 205" />
          <path d="M770 226 C 950 112 1118 350 1305 242 S 1530 130 1710 240" />
          <path d="M770 666 C 948 548 1115 790 1300 684 S 1520 566 1710 676" />
          <path d="M760 704 C 942 586 1104 830 1290 722 S 1518 604 1700 714" />
        </g>
        <g fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1.25" vector-effect="non-scaling-stroke">
          <path d="M-80 452 C 105 352 240 540 410 454 S 650 352 810 444" />
          <path d="M790 454 C 962 348 1110 550 1280 452 S 1515 348 1680 444" />
        </g>
      </svg>
      <header class="intro-loader-frame">
        <div class="intro-loader-brand">
          <span class="intro-loader-monogram"><img src="/brands/vireon-mark.svg" alt="" width="36" height="36" /></span>
          <span class="intro-loader-brand-copy"><strong>VIREON NOCTIS</strong></span>
        </div>
      </header>
      <main class="intro-loader-stage">
        <div class="intro-loader-artwork" aria-hidden="true">
          <div class="intro-loader-artwork-guides"></div>
          <div class="intro-loader-light-core"></div>
          <div class="intro-loader-glass" aria-hidden="true">
            <span class="intro-loader-glass-ring"></span>
            <span class="intro-loader-glass-leaf intro-loader-glass-leaf-left">
              <i class="intro-loader-glass-facet"></i>
              <i class="intro-loader-glass-edge"></i>
            </span>
            <span class="intro-loader-glass-leaf intro-loader-glass-leaf-right">
              <i class="intro-loader-glass-facet"></i>
              <i class="intro-loader-glass-edge"></i>
            </span>
            <span class="intro-loader-glass-axis"></span>
          </div>
        </div>
        <div class="intro-loader-title">
          <h2><span class="intro-loader-title-line">VIREON</span><span class="intro-loader-title-line intro-loader-title-outline">NOCTIS</span></h2>
        </div>
        <div class="intro-loader-bottom">
          <div class="intro-loader-status"><span id="intro-stage">COMPOSING THE FORM</span></div>
          <div class="intro-loader-progress"><span id="intro-fill"></span></div>
          <div class="intro-loader-readout"><span>LOADING</span><strong id="intro-count">00</strong><span>%</span></div>
        </div>
      </main>
      <div class="intro-loader-wipe" id="intro-wipe" aria-hidden="true"></div>
    </div>
  </Teleport>
</template>
