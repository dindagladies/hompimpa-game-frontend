import Link from "next/link";
import Layout from "../../components/layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

export const getServerSideProps = (async (context : GetServerSidePropsContext) => {
  const code = context.query.code
  return {
    props: {code},
  }
}) satisfies GetServerSideProps<{}>;

export default function Game({
  code,
}: InferGetServerSidePropsType<typeof getServerSideProps> & { code: string}) {
  const router = useRouter();
  // const code = router.query.code;
  // TODO: change code to getServerSideProps
  const [playerLogin, setPlayerLogin] = useState({ id: 0, username: "" });
  const [start, setStart] = useState(null);
  const [countdown, setCountdown] = useState(30);

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

    async function gameInfo() {
      const res = await fetch("http://127.0.0.1:4000/api/game/info/" + code, {
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
    console.log(router.query.code);
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
        }
      }
    }, 1000);
    // return () => clearInterval(interval);
  }, [countdown, start]);

  async function insertVote(hand_choice: string) {
    const response = await fetch(
      "http://127.0.0.1:4000/api/vote/" + code + "/" + playerLogin.id,
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
    router.push("/waiting-room?code=" + code);
  }

  return (
    <Layout>
      What is your choose ? <br />
      <button onClick={() => insertVote("light")}>Light</button> &nbsp;
      {/* <button href={'/waiting-room?data=dark&code='+ code}>Dark</button> */}
      <button onClick={() => insertVote("dark")}>Dark</button>
      <p>{countdown}</p>
    </Layout>
  );
}
