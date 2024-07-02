import Link from "next/link";
import Layout from "../../components/layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function WaitingRoom() {
  const router = useRouter();
  const code = router.query.code;
  const [playerLogin, setPlayerLogin] = useState({id: 0, username: ""});

  useEffect(() => {
    async function checkLoginPlayer() {
      const res = await fetch(process.env.API_URL + "/api/player", {
        credentials: "include",
      });
      // const data = 
    }
  });

  return <Layout>
    <h2>Waiting counting result...</h2>
    <Link href={"/result?code=" + code}>Next</Link>
  </Layout>;
}
