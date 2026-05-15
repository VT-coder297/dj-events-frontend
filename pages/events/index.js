import Layout from '@/components/Layout';
import EventItem from '@/components/EventItem';
import Pagination from '@/components/Pagination';
import { API_URL, PER_PAGE } from '@/config/index';

export default function EventsPage({ events, page, total }) {
  return (
    <Layout>
      <h1>Events</h1>
      {events.length === 0 && <h3>No events to show</h3>}

      {events.map((evt) => (
        <EventItem key={evt.id} evt={evt} />
      ))}

      <Pagination page={page} total={total} />
    </Layout>
  );
}

export async function getServerSideProps({ query: { page = 1 } }) {
  // 1. Fetch events with pagination metadata
  const res = await fetch(
    `${API_URL}/api/events?populate=*&sort=date:asc&pagination[pageSize]=${PER_PAGE}&pagination[page]=${page}`,
  );

  const json = await res.json();

  // 2. Extract total from the meta object
  const total = json.meta?.pagination?.total || 0;

  return {
    props: {
      events: json.data || [],
      page: +page,
      total,
    },
  };
}
