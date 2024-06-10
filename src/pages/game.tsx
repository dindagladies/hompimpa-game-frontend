import Link from "next/link";
import Layout from "../../components/layout";
import { useRouter } from "next/router";

export default function Game() {
	const router = useRouter();
	const code = router.query.code;
	const playerId = localStorage.getItem('player_id');

	async function insertLightVote() {
    const response = await fetch("http://127.0.0.1:4000/api/vote/"+ code +'/'+ playerId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        game_type_id: 1,
        hand_choice: 'light'
      }),
    })

    const data = await response.json();
    router.push('/waiting-room?code=' + code)
	}

	async function insertDarkVote() {
    const response = await fetch("http://127.0.0.1:4000/api/vote/"+ code +'/'+ playerId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        game_type_id: 1,
        hand_choice: 'dark'
      }),
    })

    const data = await response.json();
    router.push('/waiting-room?code=' + code)
	}

	return (
    <Layout>
      What is your choose ? <br />
      <button onClick={insertLightVote}>Light</button> &nbsp;
      {/* <button href={'/waiting-room?data=dark&code='+ code}>Dark</button> */}
      <button onClick={insertDarkVote}>Dark</button>
    </Layout>
  );
}
