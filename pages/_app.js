import "tailwindcss/tailwind.css";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Image Cropper</title>
        <meta name="viewport" content="width=device-width, user-scalable=no" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-black">
        <div className="max-w-sm p-4 mx-auto text-gray-200">
          <Component {...pageProps} />
        </div>
      </div>
    </>
  );
}

export default MyApp;
