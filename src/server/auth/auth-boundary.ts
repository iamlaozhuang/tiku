export type AuthSessionSnapshot = {
  token: string;
  auth_user_id: string;
  expires_at: Date;
};

export type AuthAdapterBoundary = {
  findSessionByToken(token: string): Promise<AuthSessionSnapshot | null>;
};
