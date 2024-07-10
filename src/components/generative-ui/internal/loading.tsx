import { h } from "@stencil/core";

export const renderLoading = (id: string) => (
  <div slot={id} aria-hidden="true" class="generative-ui__loading">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="generative-ui__spinner-loading"
      viewBox="0 0 24 24"
      width="40"
      height="40"
    >
      <path
        d="M12 2.28571C6.63495 2.28571 2.28571 6.63495 2.28571 12C2.28571 17.3651 6.63495 21.7143 12 21.7143C12.6312 21.7143 13.1429 22.226 13.1429 22.8571C13.1429 23.4883 12.6312 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 12.6312 23.4883 13.1429 22.8571 13.1429C22.226 13.1429 21.7143 12.6312 21.7143 12C21.7143 6.63495 17.3651 2.28571 12 2.28571Z"
        fill="url(#gradient)"
      />
      <defs>
        <linearGradient
          id="gradient"
          x1="11"
          y1="24"
          x2="20"
          y2="9.71429"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="var(--colors-foundation-un-color__purple--100)" />
          <stop
            offset="1"
            stop-color="var(--colors-foundation-un-color__purple--300)"
          />
        </linearGradient>
      </defs>
    </svg>
  </div>
);
