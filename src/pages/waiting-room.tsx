import Layout from "../../components/layout";
import { useRouter } from "next/router";

export default function WaitingRoom() {
  const router = useRouter();
  const data = router.query.data;
  const code = router.query.code;
  const playerId = localStorage.getItem('player_id');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("http://127.0.0.1:4000/api/vote/"+ code +'/'+ playerId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        game_type_id: 1,
        hand_choice: formData.get('hand_choice')
      }),
    })

    const data = await response.json();
    router.push('/result?code=' + data.data.code)
  }

  return <Layout>
    <h2>Waiting counting result...</h2>
    <form onSubmit={onSubmit}>
      <input type="hidden" name="hand_choice" value={data} />
      <button type="submit">Next</button>
    </form>
  </Layout>;
}
