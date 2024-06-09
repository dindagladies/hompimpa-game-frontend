import Link from "next/link";
import Layout from "../../components/layout";

export default function Game() {
    return (
        <Layout>
            What is your choose ? <br />
            <Link href="/waiting-room">Light</Link> &nbsp;
            <Link href="/waiting-room">Dark</Link>
        </Layout>
    );
}