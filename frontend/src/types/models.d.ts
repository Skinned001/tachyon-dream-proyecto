export type User = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'COMITE' | 'AUTOR';
};

export type Article = {
  id: string;
  title: string;
  status: string;
};

export type LibraryResource = {
  id: string;
  title: string;
  url: string;
};
