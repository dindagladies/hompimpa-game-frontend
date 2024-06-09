import Head from "next/head";
import Layout from "../../components/layout";
import Link from "next/link";
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

interface Game {
  id: number
  code: string
  round: number
  player_id: number
  game_type_id: number
  hand_choice: string
  created_at: string
}

type ApiGameResponse = {
  data: Game[],
  message: string,
};

export const getServerSideProps = (async (context: GetServerSidePropsContext) => {
  const res = await fetch("http://127.0.0.1:4000/api/game/"+ context.query.code);
  const datas: ApiGameResponse = await res.json();
  console.log(datas.data);
  return {
    props: { datas },
  };
}) satisfies GetServerSideProps<{ datas: ApiGameResponse }>;

export default function Lobby({
  datas,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  return (
    <Layout>
      <Head>
        <title>Hompimpa Game</title>
      </Head>
      <h1>Hompimpa Game</h1>
      <p>Room Code : ABC</p>
      {
        datas.data?.map((item) => (
          <p>{item.player_id}</p>
        ))
      }
      <p className="{styles.button-start}">
        <Link href="/game">Start Now</Link>
      </p>
    </Layout>
  );
}
