export type User = {
  uid: string;
  email: string | null;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: number; 
  updatedAt: number;
  uid: string;
};

export const NOTE_COLORS = [
    'bg-white',
    'bg-red-200',
    'bg-orange-200',
    'bg-amber-200',
    'bg-lime-200',
    'bg-green-200',
    'bg-emerald-200',
    'bg-cyan-200',
    'bg-sky-200',
    'bg-indigo-200',
    'bg-purple-200',
    'bg-pink-200',
];