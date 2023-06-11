import Head from 'next/head'
import NavBar from '@/components/navbar'
import '@/styles/globals.css'
import { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Blog Now</title>
        <meta name="description" content="Blog Website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <NavBar {...pageProps} />
      <Component {...pageProps} />
    </>
  )
}

// export async function getServerSideProps(context) {
//   console.log(context)

//   return {
//     props: {}
//   }
// }