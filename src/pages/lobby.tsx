import Head from "next/head";
import Layout from "../../components/layout";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { start } from "repl";

interface Game {
  code: string;
  player: {
    id: number;
    username: string;
  };
}

export default function Lobby() {
  const [dataPlayers, setData] = useState<Game[]>([]);
  const [playerLogin, setPlayerLogin] = useState({ id: 0, username: "" });
  const router = useRouter();
  const code = router.query.code;
  const [host, setHost] = useState(null);

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

    async function getGameHost() {
      const res = await fetch("http://127.0.0.1:4000/api/game/info/" + code, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        router.push("/menu")
      } else {
        setHost(data.data.host_id);
      }
    }
    getGameHost();
  }, [code, router]);

  useEffect(() => {
    // exit game when player close tab
    // TODO: don't do this when refresh page
    // window.onbeforeunload = function () {
    //   exitGame();
    // };
    console.log("host: ", host);
  }, [dataPlayers, host]);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (playerLogin.id !== 0 && playerLogin.username !== "") {
      ws.current = new WebSocket("ws://127.0.0.1:4000/ws");
      ws.current.onerror = (err) => console.log(err);
      ws.current.onopen = () => {
        console.log(
          "connected player : ",
          playerLogin.id + " " + playerLogin.username
        );
        if (ws.current) {
          ws.current.send(
            JSON.stringify({
              code: code,
              player_id: Number(playerLogin.id),
              player: {
                id: Number(playerLogin.id),
                username: playerLogin.username,
              },
            })
          );
        }
      };
      ws.current.onmessage = (msg) => {
        const message = JSON.parse(msg.data);
        console.log("message from ws : ", message);
        if (message.player.id !== Number(playerLogin.id)) {
          if (message.action === "exit") {
            setData((prevDataPlayers) =>
              prevDataPlayers.filter(
                (item) => item.player.id !== message.player.id
              )
            );
          } else if (message.action === "start") {
            router.push("/game?code=" + code);
          } else {
            setData((prevDataPlayers) => [...prevDataPlayers, message]);
          }
        }
      };

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }
  }, [playerLogin, code, router]);

  async function exitGame() {
    const res = await fetch("http://127.0.0.1:4000/api/exit/" + code, {
      method: "POST",
      credentials: "include",
      keepalive: true,
    });

    const data = await res.json();

    if (res.ok && ws.current) {
      ws.current.send(
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
      router.push("/menu");
    } else {
      alert(data.message);
      return;
    }
  }

  async function startGame() {
    // TODO: update started_at in game table
    const res = await fetch("http://127.0.0.1:4000/api/game/info/" + code, {
      method: "POST",
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message);
      return;
    }

    if (ws.current) {
      ws.current.send(
        JSON.stringify({
          code: code,
          player_id: Number(playerLogin.id),
          player: {
            id: Number(playerLogin.id),
            username: playerLogin.username,
          },
          start_at : data.data.started_at,
          action: "start",
        })
      );
      // return () => {
      // TODO: check this, not testing yet
      router.push("/game?code=" + code);
    }
    // };
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
        <p key={item.player.username}>{item.player.username}</p>
      ))}
      <div className="{styles.button-start}">
        {host === playerLogin.id ? (
          <button onClick={startGame}>Start Now</button>
        ) : (
          <p>Waiting host start the game</p>
        )}
      </div>
      <button onClick={exitGame}>Exit room</button>
    </Layout>
  );
}
