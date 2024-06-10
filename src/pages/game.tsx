import Link from "next/link";
import Layout from "../../components/layout";
import { useRouter } from "next/router";

export default function Game() {
	const router = useRouter();
	const code = router.query.code;

	return (
    <Layout>
      What is your choose ? <br />
      <Link href={'/waiting-room?data=light&code='+ code}>Light</Link> &nbsp;
      <Link href={'/waiting-room?data=dark&code='+ code}>Dark</Link>
    </Layout>
  );
}
