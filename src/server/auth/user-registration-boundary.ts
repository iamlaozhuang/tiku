export type CreatePasswordCredentialInput = {
  phone: string;
  password: string;
};

export type CreatedPasswordCredential = {
  authUserId: string;
};

export type UserRegistrationCredentialAdapter = {
  createPasswordCredential(
    input: CreatePasswordCredentialInput,
  ): Promise<CreatedPasswordCredential>;
};
