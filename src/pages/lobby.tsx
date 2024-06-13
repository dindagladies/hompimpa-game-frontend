import Head from "next/head";
import Layout from "../../components/layout";
import Link from "next/link";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useEffect, useState } from "react";

interface Game {
  code: string;
  player: {
    id: number;
    username: string;
  };
}

type ApiGameResponse = {
  data: Game[];
  message: string;
};

export const getServerSideProps = (async (
  context: GetServerSidePropsContext
) => {
  const res = await fetch(
    "http://127.0.0.1:4000/api/game/" + context.query.code
  );
  const datas: ApiGameResponse = await res.json();

  return {
    props: { datas },
  };
}) satisfies GetServerSideProps<{ datas: ApiGameResponse }>;

export default function Lobby({
  datas,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [dataPlayers, setData] = useState(datas.data);

  useEffect(() => {
    const playerId = localStorage.getItem("player_id");
    const username = localStorage.getItem("username");
    const newWS = new WebSocket("ws://127.0.0.1:4000/ws");
    newWS.onerror = (err) => console.log(err);
    newWS.onopen = () => {
      newWS.send(
        JSON.stringify({
          code: datas.data[0].code,
          player_id: Number(playerId),
          player: { id: Number(playerId), username: username },
        })
      );
    };
    newWS.onmessage = (msg) => {
      // if datas.data[0].code == msg.data {
      const message = JSON.parse(msg.data);
      if (message.player.id !== Number(playerId)) {
        setData([...dataPlayers, message]);
      }
      // }
    };

    return () => {
      newWS.close();
    };
  }, []);

  return (
    <Layout>
      <Head>
        <title>Hompimpa Game</title>
      </Head>
      <h1>Hompimpa Game</h1>
      <p>Room Code : {datas?.data[0]?.code}</p>
      {dataPlayers.map((item) => (
        <p>{item.player.username}</p>
      ))}
      <p className="{styles.button-start}">
        <Link href={"game?code=" + datas.data[0].code}>Start Now</Link>
      </p>
    </Layout>
  );
}
