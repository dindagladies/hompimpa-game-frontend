import next, { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Layout from "../../components/layout";
import Link from "next/link";

// TODO:
/*
1. check if all player already submit a vote
2. count the vote
3. show in this
*/

type ApiCountResponse = {
  continue_round: true
  message: string
  next_game_type: number
  vote_result: []
  winner: string
};

interface Game {
  id: number;
  code: string;
  round: number;
  player_id: number;
  player : {
    id: number;
    username: string;
  },
  game_type_id: number;
  hand_choice: string;
  created_at: string;
}

type ApiNextRoundResponse = {
	data : Game[]
}

export const getServerSideProps = (async (
  context: GetServerSidePropsContext
) => {
	const code = context.query.code;
  const countRes = await fetch("http://127.0.0.1.:4000/api/count/"+ code);
  const result: ApiCountResponse = await countRes.json();

	const nextRes = await fetch("http://127.0.0.1:4000/api/game/"+ code +"?round=next");
	const nextData: ApiNextRoundResponse = await nextRes.json();


	return {
    props: {result, nextData, code},
  };
}) satisfies GetServerSideProps<{ result: ApiCountResponse, nextData: ApiNextRoundResponse }>;

export default function Result({
  code,
	result,
	nextData,
}: InferGetServerSidePropsType<typeof getServerSideProps> & { result: ApiCountResponse, nextData: ApiNextRoundResponse
}) {
  const playerId = localStorage.getItem("player_id");
  const isPlayerContinueTheGame = (nextData.data.find((item) => item.player.id == Number(playerId))) != undefined;
  console.log(isPlayerContinueTheGame);
  console.log(playerId);

  return (
    <Layout>
      <h1>The winner is {result?.winner}</h1>
      <p>Next Player :</p>
			{nextData?.data?.map((item) => (
				<p>{item.player.username}</p>
			))}
      <p>Next Round will start in 5 seconds ...</p>
      {isPlayerContinueTheGame ? <Link href={"/game?code="+ code}>Next</Link> : <p>Game over</p>}
    </Layout>
  );
}
