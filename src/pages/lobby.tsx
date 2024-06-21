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
  const [playerLogin, setPlayerLogin] = useState({ id: 0, username: "" });

  useEffect(() => {
    // const playerId = localStorage.getItem("player_id");
    // const username = localStorage.getItem("username");

    async function fetchPlayer() {
      const res = await fetch("http://127.0.0.1:4000/api/player", {
        credentials: "include",
      });
      const data = await res.json();
      // console.log("data player : ", data);
      // TODO: fix failed to set
      setPlayerLogin(data);

    };
    
    fetchPlayer();
    // console.log("player : ", playerLogin);
  }, []);

  useEffect(() => {
    console.log("playerLogin : ", playerLogin);
    if (playerLogin.id !== 0 && playerLogin.username !== "") {
      const newWS = new WebSocket("ws://127.0.0.1:4000/ws");
      newWS.onerror = (err) => console.log(err);
      newWS.onopen = () => {
        console.log(
          "connected player : ",
          playerLogin.id + " " + playerLogin.username
        );
        newWS.send(
          JSON.stringify({
            code: datas.data[0].code,
            player_id: Number(playerLogin.id),
            player: {
              id: Number(playerLogin.id),
              username: playerLogin.username,
            },
          })
        );
      };
      newWS.onmessage = (msg) => {
        // TODO: filter lobby base on code game player
        // if datas.data[0].code == msg.data {
        const message = JSON.parse(msg.data);
        console.log("message from ws : ", message);
        if (message.player.id !== Number(playerLogin.id)) {
          setData(prevDataPlayers => [...prevDataPlayers, message]);
        }
        // }
      };

      return () => {
        newWS.close();
      };
    }
  }, [playerLogin]);

  // console.log("dataPlayers Outside : ", dataPlayers);

  return (
    <Layout>
      <Head>
        <title>Hompimpa Game</title>
      </Head>
      <h1>Hompimpa Game</h1>
      <p>Welcome, {playerLogin.username} !</p>
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
