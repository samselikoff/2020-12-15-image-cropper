import "tailwindcss/tailwind.css";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Image Cropper</title>
        <meta name="viewport" content="width=device-width, user-scalable=no" />
      </Head>
      <div className="min-h-screen ">
        <div className="max-w-sm p-4 mx-auto text-gray-900 bg-white">
          <Component {...pageProps} />
        </div>
      </div>
    </>
  );
}

export default MyApp;
