import Layout from "../../components/layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";

export const getServerSideProps = (async (
  context: GetServerSidePropsContext
) => {
  const code = context.query.code;
  return {
    props: { code },
  };
}) satisfies GetServerSideProps<{}>;

export default function Game({
  code,
}: InferGetServerSidePropsType<typeof getServerSideProps> & { code: string }) {
  const router = useRouter();
  const [playerLogin, setPlayerLogin] = useState({ id: 0, username: "" });
  const [start, setStart] = useState(null);
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
        console.log(data);
      }
    }
    gameInfo();
  }, [code, router]);

  useEffect(() => {
    if (start === null) return;
    const startedAt = new Date(start).getTime();

    const interval = setInterval(() => {
      if (countdown !== 0) {
        const newDate = new Date().getTime();
        var diff = (newDate - startedAt) / 1000;
        var time = 30 - diff;
        var count = parseInt(time.toString().split(".")[0]);
        setCountdown(count);
        if (count <= 0) {
          setCountdown(0);
          router.push("/waiting-room?code=" + code);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, start, router, code]);

  async function insertVote(hand_choice: string) {
    const response = await fetch(
      process.env.API_URL + "/vote/" + code + "/" + playerLogin.id,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game_type_id: 1,
          hand_choice: hand_choice,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      alert(data.message);
      return;
    }
    router.push("/waiting-room?code=" + code);
  }

  return (
    <Layout>
      What is your choose ? <br />
      <button onClick={() => insertVote("rock")}>Rock</button> &nbsp;
      <button onClick={() => insertVote("scissors")}>Scissors</button> &nbsp;
      <button onClick={() => insertVote("paper")}>Paper</button>
      <p>{countdown}</p>
    </Layout>
  );
}
