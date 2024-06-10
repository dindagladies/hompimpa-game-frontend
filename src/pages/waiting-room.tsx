import Link from "next/link";
import Layout from "../../components/layout";
import { useRouter } from "next/router";

export default function WaitingRoom() {
  const router = useRouter();
  const code = router.query.code;
  // const playerId = localStorage.getItem('player_id');

  return <Layout>
    <h2>Waiting counting result...</h2>
    <Link href={"/result?code=" + code}>Next</Link>
  </Layout>;
}
