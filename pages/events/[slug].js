import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPencilAlt, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/Layout';
import { API_URL } from '@/config';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import styles from '@/styles/Event.module.css';
import { useRouter } from 'next/router';
import { parseCookies } from '@/helpers/index';

export default function EventPage({ evt, token }) {
  const router = useRouter();

  // 1. CRITICAL: Handle the background page generation state safely
  if (router.isFallback) {
    return (
      <Layout title="Loading...">
        <div className="container">
          <h3>Loading event data...</h3>
        </div>
      </Layout>
    );
  }

  if (!evt) {
    return (
      <Layout title="Not Found">
        <div
          className="container"
          style={{ textAlign: 'center', marginTop: '40px' }}
        >
          <h3>Event not found</h3>
          <Link href="/events">Go Back to Events</Link>
        </div>
      </Layout>
    );
  }

  const deleteEvent = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('You must be logged in to delete an event.');
      return;
    }

    if (confirm('Are you sure you want to delete this event?')) {
      try {
        // 1. Immediately redirect the router to a safe index page to avoid a 404 error layout crash
        router.push('/events');

        // 2. Fire the database drop request in the background
        const res = await fetch(`${API_URL}/api/events/${evt.documentId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(
            data.error?.message || 'Something went wrong while deleting.',
          );
          // Revert back if the backend fails
          router.push(`/events/edit/${evt.documentId}`);
        } else {
          toast.success('Event and media assets deleted successfully.');
        }
      } catch (err) {
        toast.error('An unexpected transmission error occurred.');
        console.error(err);
      }
    }
  };

  // Safe image path preview rendering tool
  const imageUrl =
    Array.isArray(evt.image) && evt.image.length > 0
      ? evt.image[0].url
      : evt.image?.url || null;

  return (
    <Layout title={evt.name}>
      <div className={styles.event}>
        {token && (
          <div className={styles.controls}>
            <Link href={`/events/edit/${evt.documentId}`}>
              <FaPencilAlt /> Edit Event
            </Link>
            <button
              className={styles.delete}
              onClick={deleteEvent}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <FaTimes /> Delete Event
            </button>
          </div>
        )}

        <span>
          {evt.date
            ? new Date(evt.date).toLocaleDateString('en-US')
            : 'No Date Set'}{' '}
          at {evt.time || 'No Time Set'}
        </span>
        <h1>{evt.name}</h1>
        <ToastContainer />

        {imageUrl && (
          <div className={styles.image}>
            <Image
              src={imageUrl}
              width={960}
              height={600}
              alt={evt.name}
              priority
            />
          </div>
        )}

        <h3>Performers:</h3>
        <p>{evt.performers || 'No performers listed'}</p>
        <h3>Description:</h3>
        <div className={styles.description}>
          {evt.description && Array.isArray(evt.description) ? (
            <BlocksRenderer content={evt.description} />
          ) : (
            <p>No description provided.</p>
          )}
        </div>
        <h3>Venue: {evt.venue || 'TBD'}</h3>
        <p>{evt.address || 'Address unavailable'}</p>

        <Link href="/events" className={styles.back}>
          {'<'} Go Back
        </Link>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  try {
    const res = await fetch(`${API_URL}/api/events`);
    const json = await res.json();

    if (!json.data || !Array.isArray(json.data)) {
      return { paths: [], fallback: 'blocking' };
    }

    const paths = json.data
      .filter((evt) => evt && evt.slug)
      .map((evt) => ({
        params: { slug: String(evt.slug) },
      }));

    return {
      paths,
      // FIXED: Set fallback to 'blocking' to completely eliminate runtime 404 ENOENT page loading bugs
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error fetching static paths:', error);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params: { slug }, req }) {
  try {
    const cookies = parseCookies(req);
    const token = cookies.token || null;

    const res = await fetch(
      `${API_URL}/api/events?filters[slug][$eq]=${slug}&populate=*`,
    );
    const json = await res.json();

    return {
      props: {
        // FIXED FOR STRAPI V5: Unpacks data array position 0 to provide a flat object to the component layout
        evt: json.data && json.data.length > 0 ? json.data[0] : null,
        token,
      },
      revalidate: 1,
    };
  } catch (error) {
    console.error('Error fetching event details:', error);
    return {
      props: {
        evt: null,
        token: null,
      },
      revalidate: 1,
    };
  }
}
