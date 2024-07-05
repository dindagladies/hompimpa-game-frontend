import Link from "next/link";
import Layout from "../../components/layout";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function WaitingRoom() {
  const router = useRouter();
  const code = router.query.code;
  const [playerLogin, setPlayerLogin] = useState({ id: 0, username: "" });
  const [start, setStart] = useState(null);
  const [host, setHost] = useState(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    async function checkLoginPlayer() {
      const res = await fetch(process.env.API_URL + "/player", {
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

    async function gameInfo() {
      const res = await fetch(process.env.API_URL + "/game/info/" + code, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        router.push("/lobby?code=" + code);
      } else {
        setStart(data.data.started_at);
        setHost(data.data.host_id);
        console.log(data);
      }
    }
    gameInfo();
  }, [code, router]);

  // TODO: is countdown is stil needed?
  useEffect(() => {
    if (start === null) return;
    const startedAt = new Date(start).getTime();

    async function countingResult() {
      const res = await fetch(process.env.API_URL + "/count/" + code, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
      } else {
        router.push("/result?code=" + code);
      }
    }

    const interval = setInterval(() => {
      if (countdown !== 0) {
        const newDate = new Date().getTime();
        var diff = (newDate - startedAt) / 1000;
        var time = 15 - diff;
        var count = parseInt(time.toString().split(".")[0]);
        setCountdown(count);
        if (count <= 0) {
          setCountdown(0);
          if (playerLogin.id === host) {
            countingResult();
          } else {
            router.push("/result?code=" + code);
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, start, host, router, code, playerLogin]);

  const ws = useRef<WebSocket | null>(null);
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:4000/ws");
    ws.current.onerror = (err) => console.log(err);
    ws.current.onopen = () => {
      console.log(
        "connected player : ",
        playerLogin.id + " " + playerLogin.username
      );
    };
    ws.current.onmessage = (msg) => {
      const message = JSON.parse(msg.data);
      console.log("message from ws : ", message);
      if (message.code !== code) return;
      if (message.action === "result") {
        router.push("/result?code=" + code);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    }
  });

  return (
    <Layout>
      <p>{playerLogin.username}</p>
      <h2>Waiting other player.. {countdown}</h2>
      {/* <Link href={"/result?code=" + code}>Next</Link> */}
    </Layout>
  );
}
