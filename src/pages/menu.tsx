import Link from "next/link";
import Layout from "../../components/layout";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Menu() {
  const router = useRouter();
  // TODO: set get localstorage in client side
  const playerId = localStorage.getItem("player_id");

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
        player_id: Number(playerId),
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
          player_id: Number(playerId),
        }),
      });

      const data = await response.json();
      router.push("/lobby?code=" + data.data.code);
    }
  }

  return (
    <Layout>
      <form onSubmit={onSubmit}>
        <input type="text" name="code" placeholder="Enter code game" />
        <button type="submit">Join</button>
      </form>
      <button onClick={createGameCode}>Create New Room</button>
    </Layout>
  );
}
