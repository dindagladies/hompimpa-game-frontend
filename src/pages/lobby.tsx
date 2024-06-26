import Head from "next/head";
import Layout from "../../components/layout";
import Link from "next/link";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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

export default function Lobby() {
  const [dataPlayers, setData] = useState<Game[]>([]);
  const [playerLogin, setPlayerLogin] = useState({ id: 0, username: "" });
  const router = useRouter();
  const code = router.query.code;

  useEffect(() => {
    async function checkLoginPlayer() {
      const res = await fetch("http://127.0.0.1:4000/api/player", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        router.push("/");
      } else {
        setPlayerLogin(data);
      }
    }
    checkLoginPlayer();

    async function getPlayerOnGame() {
      const res = await fetch("http://127.0.0.1:4000/api/game/" + code, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        router.push("/menu");
      } else {
        setData(data.data);
      }
    }

    getPlayerOnGame();
  }, [code]);

  useEffect(() => {
    // exit game when player close tab
    // TODO: don't do this when refresh page
    // window.onbeforeunload = function () {
    //   exitGame();
    // };
  }, [dataPlayers]);

  useEffect(() => {
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
            code: code,
            player_id: Number(playerLogin.id),
            player: {
              id: Number(playerLogin.id),
              username: playerLogin.username,
            },
          })
        );
      };
      newWS.onmessage = (msg) => {
        const message = JSON.parse(msg.data);
        console.log("message from ws : ", message);
        if (message.player.id !== Number(playerLogin.id)) {
          if (message.action === "exit") {
            setData((prevDataPlayers) =>
              prevDataPlayers.filter(
                (item) => item.player.id !== message.player.id
              )
            );
          } else {
            setData((prevDataPlayers) => [...prevDataPlayers, message]);
          }
        }
      };

      return () => {
        newWS.close();
      };
    }
  }, [playerLogin, code]);

  async function exitGame() {
    const res = await fetch("http://127.0.0.1:4000/api/exit/" + code, {
      method: "POST",
      credentials: "include",
      keepalive: true,
    });

    const data = await res.json();

    if (res.ok) {
      // TODO: send message to ws
      const newWS = new WebSocket("ws://127.0.0.1:4000/ws");
      newWS.onerror = (err) => console.log(err);
      newWS.onopen = () => {
        console.log(
          "exit player : ",
          playerLogin.id + " " + playerLogin.username
        );
        newWS.send(
          JSON.stringify({
            code: code,
            player_id: Number(playerLogin.id),
            player: {
              id: Number(playerLogin.id),
              username: playerLogin.username,
            },
            action: "exit",
          })
        );
      };
      return () => {
        // TODO: check this
        newWS.close();
        router.push("/menu");
      };
    } else {
      alert(data.message);
      return ;
    }
  }

  return (
    <Layout>
      <Head>
        <title>Hompimpa Game</title>
      </Head>
      <h1>Hompimpa Game</h1>
      <p>Welcome, {playerLogin.username} !</p>
      <p>Room Code : {code}</p>
      {dataPlayers?.map((item) => (
        <p>{item.player.username}</p>
      ))}
      <p className="{styles.button-start}">
        <Link href={"game?code=" + code}>Start Now</Link>
      </p>
      <button onClick={exitGame}>Exit room</button>
    </Layout>
  );
}
