import Layout from "../../components/layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Player = {
  data: {
    id: number;
    username: string;
  };
};

export default function Menu() {
  const router = useRouter();
  const [player, setPlayer] = useState({ id: 0, username: "" });

  useEffect(() => {
    async function fetchPlayer() {
      const res = await fetch("http://127.0.0.1:4000/api/player", {
        credentials: "include",
      });
      const data = await res.json();
      setPlayer(data);
    }
    fetchPlayer();
  }, []);

  useEffect(() => {
    if (player.id !== 0) {
      router.push("/");
    }
  }, [player]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("http://127.0.0.1:4000/api/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: formData.get("code"),
        player_id: Number(player.id),
      }),
    });

    const data = await response.json();
    const code = data.data.code;
    router.push("/lobby?code=" + code);
  }

  async function createGameCode() {
    const res = await fetch("http://127.0.0.1:4000/api/code", {
      method: "POST",
    });
    const data = await res.json();
    const code = data.data.code;

    if (code !== "") {
      const response = await fetch("http://127.0.0.1:4000/api/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          player_id: Number(player.id),
        }),
      });

      const data = await response.json();
      router.push("/lobby?code=" + data.data.code);
    }
  }

  return (
    <Layout>
      <p>Welcome, {player.username}!</p>
      <form onSubmit={onSubmit}>
        <input type="text" name="code" placeholder="Enter code game" />
        <button type="submit">Join</button>
      </form>
      <button onClick={createGameCode}>Create New Room</button>
    </Layout>
  );
}
