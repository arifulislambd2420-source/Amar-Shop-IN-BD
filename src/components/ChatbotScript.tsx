"use client";

import Script from "next/script";

export default function ChatbotScript() {
  // Using Tawk.to as an example placeholder.
  // The site owner needs to replace this with their actual Property ID and Widget ID
  const tawkToSrc = process.env.NEXT_PUBLIC_TAWKTO_SRC || "";
  
  if (!tawkToSrc) return null;

  return (
    <Script id="tawkto-script" strategy="lazyOnload">
      {`
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='${tawkToSrc}';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
        })();
      `}
    </Script>
  );
}
