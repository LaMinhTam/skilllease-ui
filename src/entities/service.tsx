import { User } from './user';
import { Category } from './category';

export interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  freelancer: User;
  category: Category;
}
