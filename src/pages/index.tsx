import Head from "next/head";
import Layout from "../../components/layout";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function checkLoginPlayer() {
      const response = await fetch("http://127.0.0.1:4000/api/player", {
        credentials: "include",
      });

      if (response.ok) {
        router.push("/menu");
      }
    }

    checkLoginPlayer();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const response = await fetch("http://127.0.0.1:4000/api/player", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.get("username"),
      }),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.message);
      return;
    }

    router.push("/menu");
  }

  return (
    <Layout>
      <Head>
        <title>Hompimpa Game</title>
      </Head>
      <h1>Hompimpa Game</h1>
      <form onSubmit={onSubmit}>
        <input type="text" name="username" placeholder="Enter Username" />
        <button type="submit">Submit</button>
      </form>
    </Layout>
  );
}
