import { config } from "dotenv";
config();

/** `.env`ファイルから定数を読み取ってオブジェクトとして提供する環境変数。 */
export const { DISCORD_TOKEN, DATABASE_URL, HABITICA_ENDPOINT } = process.env;
