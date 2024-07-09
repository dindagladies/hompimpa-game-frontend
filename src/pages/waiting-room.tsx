import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Layout from "../../components/layout";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export const getServerSideProps = (async (
  context: GetServerSidePropsContext
) => {
  const code = context.query.code;
  return {
    props: { code },
  };
}) satisfies GetServerSideProps<{}>;

export default function WaitingRoom({
  code,
}: InferGetServerSidePropsType<typeof getServerSideProps> & { code: string }) {
  const router = useRouter();
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

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://127.0.0.1:4000/ws");
    ws.current.onopen = () => {
      console.log(
        "connected player : ",
        playerLogin.id + " " + playerLogin.username
      );
    };
    ws.current.onmessage = (msg) => {
      const message = JSON.parse(msg.data);
      console.log("=== in waiting room to redirect to results page ===");
      console.log("message from ws : ", message);
      if (message.action === "result" && message.code === code) {
        router.push("/result?code=" + code);
      }
    };
  }, [playerLogin, code, router]);

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
        console.log("=== counting result ===");
        console.log(data);
        if (ws.current) {
          console.log("=== send result from waiting room ===");
          ws.current.send(
            JSON.stringify({
              action: "result",
              code: code,
            })
          );
        }
        router.push("/result?code=" + code);
      }
    }

    const interval = setInterval(() => {
      if (countdown !== 0) {
        const newDate = new Date().getTime();
        var diff = (newDate - startedAt) / 1000;
        var time = 30 - diff;
        var count = parseInt(time.toString().split(".")[0]);
        setCountdown(count);
        if (count <= 0) {
          setCountdown(0);
          console.log("=== waiting room :  host = ", host);
          if (playerLogin.id === host) {
            countingResult();
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, start, host, router, code, playerLogin]);

  return (
    <Layout>
      <p>{playerLogin.username}</p>
      <h2>Waiting other player.. {countdown}</h2>
    </Layout>
  );
}
