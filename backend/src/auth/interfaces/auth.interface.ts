export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  cpf: string;
  bornDate: string;
  address: string;
  telephone: string;
  role?: string;
}
