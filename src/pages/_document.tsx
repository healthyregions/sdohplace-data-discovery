import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { WebSite, Organization } from "schema-dts";
import { jsonLdScriptProps } from "react-schemaorg";
import createEmotionServer from "@emotion/server/create-instance";
import config from "@/lib/config";
import createEmotionCache from "../createEmotionCache";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
            <meta name="emotion-insertion-point" content="" />
            <meta name="viewport" content="initial-scale=1, width=device-width" />
            <meta property="og:site_name" content={config.site_title} />
            <script
                {...jsonLdScriptProps<WebSite>({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    name: config.site_title,
                    url: config.base_url
                })}
            />
            <script
                {...jsonLdScriptProps<Organization>({
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    name: "Healthy Regions and Policies Lab",
                    url: "https://healthyregions.org",
                    logo: "https://healthyregionsorg.wordpress.com/wp-content/uploads/2022/08/herop_dark_logo_teal.png",
                    contactPoint: {
                        "@type": "ContactPoint",
                        email: "mkolak@illinois.edu",
                    }
                })}
            />
            <script
                defer
                data-domain="search.sdohplace.org"
                src="https://plausible.io/js/script.pageview-props.tagged-events.js"
            ></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (ctx) => {
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: any) => (props: any) => <App emotionCache={cache} {...props} />,
    });

  const initialProps = await Document.getInitialProps(ctx);
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(" ")}`}
      key={style.key}
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    styles: [
      ...React.Children.toArray(initialProps.styles),
      ...emotionStyleTags,
    ],
  };
};
