// ✅ Next.js + Slack Bolt 自動化テンプレート

// 必要: @slack/bolt インストール済み
// `SLACK_BOT_TOKEN` と `SLACK_SIGNING_SECRET` と `SLACK_ADMIN_TOKEN` は環境変数に設定

import { App } from "@slack/bolt";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { email, clientName, option, connectOrgId } = req.body;

  try {
    // 1️⃣ チャンネル作成
    const channel = await app.client.conversations.create({
      token: process.env.SLACK_BOT_TOKEN,
      name: `client-${clientName.toLowerCase().replace(/\s+/g, "-")}`,
      is_private: true,
    });

    const channelId = channel.channel.id;

    if (option === "guest") {
      // 2️⃣ シングルチャンネルゲスト招待
      await app.client.admin.users.invite({
        token: process.env.SLACK_ADMIN_TOKEN,
        team_id: process.env.SLACK_TEAM_ID,
        email,
        is_restricted: true,
        channel_ids: channelId,
      });
      return res.status(200).json({ message: "シングルチャンネルゲスト招待完了", channelId });
    }

    if (option === "connect") {
      // 3️⃣ Slack Connect 共有チャンネルを作成して接続リクエスト送信
      await app.client.conversations.share({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channelId,
        target_team: connectOrgId, // 相手側のOrg ID
      });
      return res.status(200).json({ message: "Slack Connect 共有チャンネル招待送信完了", channelId });
    }

    return res.status(400).json({ message: "不正なオプション" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "エラー", error });
  }
}
