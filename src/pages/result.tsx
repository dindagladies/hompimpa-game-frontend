import next, {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Layout from "../../components/layout";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

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

interface GameInfo {
  id: number;
  code: string;
  is_finished: boolean;
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
  const [countdown, setCountdown] = useState(10);
  const [gameInfo, setGameInfo] = useState<GameInfo>();

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
        setGameInfo(data.data);
        console.log(data);
      }
    }
    gameInfo();

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
      };
      ws.current.onmessage = (msg) => {
        const message = JSON.parse(msg.data);
        console.log("=== in result to redirect next game ===");
        console.log("message from ws : ", message);
        if (message.action === "start") {
          if (message.player.id == Number(playerLogin.id)) {
            router.push("/game?code=" + code);
          }
        }
      };

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }
  }, [playerLogin, code, router, result]);

  useEffect(() => {
    async function nextGame() {
      // update started_at in game table
      const res = await fetch(process.env.API_URL + "/game/info/" + code, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok && ws.current) {
        console.log("=== send start game from results page ===");
        ws.current.send(
          JSON.stringify({
            action: "start",
            code: code,
            player_id: Number(playerLogin.id),
            player: {
              id: Number(playerLogin.id),
              username: playerLogin.username,
            },
            start_at: data.data.started_at,
          })
        );
        router.push("/game?code=" + code);
      } else {
        alert(data.message);
        return;
      }
      // };
    }

    // TODO: check if continue the game
    if (countdown == 0 && isPlayerWon && gameInfo?.is_finished == false) {
      setCountdown(0);
      nextGame();
      router.push("/game?code=" + code);
    }

    const interval = setInterval(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        setCountdown(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, code, router, playerLogin, isPlayerWon, gameInfo, result]);

  return (
    <Layout>
      <p>Hi, {playerLogin.username}</p>
      {gameInfo?.is_finished == false && (
        <div>
          <h1>
            {result?.hand_choice != "DRAW" && <p>The winner is</p>}{" "}
            {result?.hand_choice}{" "}
          </h1>
          {isPlayerWon && <p>Congratulation! you will join next round</p>}
          {!isPlayerWon && (
            <p>
              Sorry, you will not join next round <br />{" "}
              <Link href="/menu">Back to menu</Link>
            </p>
          )}
          <br />
          <p>Next Player :</p>
          {result?.winner_player?.map((item) => (
            <p key={item.id}>{item.username}</p>
          ))}
          {isPlayerWon && <b>Round will start in {countdown} seconds ...</b>}
        </div>
      )}
      {gameInfo?.is_finished == true && (
        <div>
          <h1>The winner is {result?.hand_choice}</h1>
          {isPlayerWon && <p>Congratulation! you are the winner!</p>}
          {!isPlayerWon && <p>Sorry, you lose</p>}
          <Link href="/menu">Back to menu</Link>
        </div>
      )}
    </Layout>
  );
}
