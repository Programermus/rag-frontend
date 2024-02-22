"use client";

import { SWRConfig } from "swr";
import { ThemeProvider } from "@material-tailwind/react";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider>
      <SWRConfig
        value={{
          fetcher: (resource, init) =>
            fetch(resource, init).then((res) => res.json()),
        }}
      >
        {children}
      </SWRConfig>
    </ThemeProvider>
  );
}
