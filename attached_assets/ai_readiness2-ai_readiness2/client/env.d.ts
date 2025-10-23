/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_AB_TEST_VARIANT?: 'A' | 'B';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
