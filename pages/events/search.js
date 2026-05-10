import qs from 'qs';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import EventItem from '@/components/EventItem';
import { API_URL } from '@/config/index';

export default function SearchPage({ events }) {
  const router = useRouter();

  return (
    <Layout title="Search Results">
      <Link href="/events">Go Back</Link>
      <h1>Search Results for {router.query.term}</h1>
      {events.length === 0 && <h3>No events to show</h3>}

      {events.map((evt) => (
        <EventItem key={evt.id} evt={evt} />
      ))}
    </Layout>
  );
}

export async function getServerSideProps({ query: { term } }) {
  // 1. Build the query object using Strapi v5/v4 logic
  const query = qs.stringify(
    {
      filters: {
        $or: [
          { name: { $containsi: term } },
          { performers: { $containsi: term } },
          { description: { $containsi: term } },
          { venue: { $containsi: term } },
        ],
      },
      populate: '*', // Ensures images come back with the search results
    },
    {
      encodeValuesOnly: true, // Clean up the URL encoding
    },
  );

  // 2. Fetch from the API
  const res = await fetch(`${API_URL}/api/events?${query}`);
  const json = await res.json();

  return {
    props: {
      events: json.data || [],
    },
  };
}
