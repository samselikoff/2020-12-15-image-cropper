import "tailwindcss/tailwind.css";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Image Cropper</title>
        <meta name="viewport" content="width=device-width, user-scalable=no" />
      </Head>
      <div className="text-gray-900">
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
