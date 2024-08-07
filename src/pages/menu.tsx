import Layout from "../../components/layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Menu() {
  const router = useRouter();
  const [player, setPlayer] = useState({ id: 0, username: "" });

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
        setPlayer(data);
      }
    }

    checkLoginPlayer();
  }, [router]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch(process.env.API_URL + "/start", {
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
    if (!response.ok) {
      alert(data.message);
      return;
    } else {
      const code = data.data.code;
      router.push("/lobby?code=" + code);
    }
  }

  async function createGameCode() {
    const res = await fetch(process.env.API_URL + "/code", {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }
    const code = data.data.code;

    if (code !== "") {
      const response = await fetch(process.env.API_URL + "/start", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          player_id: Number(player.id),
        }),
      });

      const data = await response.json();
      console.log("continue to lobby with code : ", data.data.code);
      router.push("/lobby?code=" + data.data.code);
    }
  }

  async function logout() {
    const res = await fetch(process.env.API_URL + "/logout", {
      method: "POST",
      credentials: "include",
    });

    console.log(res);
    if (res.ok) {
      router.push("/");
    } else {
      const data = await res.json();
      alert(data.message);
    }
  }

  return (
    <Layout>
      <p>Welcome, {player.username}!</p>
      <form onSubmit={onSubmit}>
        <input type="text" name="code" placeholder="Enter code game" />
        <button type="submit">Join</button>
      </form>
      <button onClick={createGameCode}>Create New Room</button>&nbsp;
      <button onClick={logout}>Logout</button>
    </Layout>
  );
}
