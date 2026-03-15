import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function NewApplicationPage() {
  redirect('/dashboard/application-center/new-app');
}
