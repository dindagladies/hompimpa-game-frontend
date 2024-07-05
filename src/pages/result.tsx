import next, {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Layout from "../../components/layout";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Game {
  id: number;
  code: string;
  round: number;
  player_id: number;
  player: {
    id: number;
    username: string;
  };
  game_type_id: number;
  hand_choice: string;
  created_at: string;
}

interface Result {
  id: number;
  code: string;
  hand_choice: string;
  round: number;
  winner_player: Player[];
  looser_player: Player[];
}

interface Player {
  id: number;
  username: string;
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const code = context.query.code;

  return {
    props: { code },
  };
};

export default function Result({
  code,
}: InferGetServerSidePropsType<typeof getServerSideProps> & { code: string }) {
  const router = useRouter();
  const [playerLogin, setPlayerLogin] = useState({ id: 0, username: "" });
  const [result, setResult] = useState<Result>();
  const [isPlayerWon, setIsPlayerWon] = useState(false);

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

    async function gameResult() {
      const res = await fetch(process.env.API_URL + "/result/" + code, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
      } else {
        setResult(data.data);
        console.log(data);
      }
    }
    gameResult();
  }, [code, router]);

  useEffect(() => {
    const isPlayerWon =
      result?.winner_player?.find(
        (item) => item.id == Number(playerLogin.id)
      ) != undefined;
    const isPlayerLoose =
      result?.looser_player?.find(
        (item) => item.id == Number(playerLogin.id)
      ) != undefined;
    if (isPlayerWon && !isPlayerLoose) setIsPlayerWon(isPlayerWon);
    setIsPlayerWon(isPlayerWon);
  }, [result, playerLogin]);

  return (
    <Layout>
      <p>Hi, {playerLogin.username}</p>
      <h1>The winner is {result?.hand_choice} </h1>
      {isPlayerWon && <p>Congratulation! you will join next round</p>}
      {!isPlayerWon && <p>Sorry, you will not join next round</p>}
      <br />
      <p>Next Player :</p>
      {result?.winner_player?.map((item) => (
        <p key={item.id}>{item.username}</p>
      ))}

      {isPlayerWon && <p>Round will start in 5 seconds ...</p>}
    </Layout>
  );
}
