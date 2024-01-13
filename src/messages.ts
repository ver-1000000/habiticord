export const MESSAGES = {
  ERROR: {
    UNKNOWN: "原因不明のエラーが発生しました……。",
    REGISTER: {
      RECONFIRM:
        "登録に失敗しました……。 もう一度ユーザーIDとAPIトークンを確認してください。",
    },
  },
  SUCCESS: {
    REGISTER: "登録が完了しました♪",
    UNREGISTER: "削除が完了しました♪",
    ATTACHMENT_SAVED: "アタッチメントを保存しました♪",
    ATTACHMENT_DELETED: "アタッチメントをすべて削除しました♪",
  },
} as const;
