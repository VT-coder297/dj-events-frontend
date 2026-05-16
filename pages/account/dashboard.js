import { parseCookies } from '@/helpers/index';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import DashboardEvent from '@/components/DashboardEvent';
import { API_URL } from '@/config/index';
import { toast, ToastContainer } from 'react-toastify'; // Fixed: Added missing toast imports
import 'react-toastify/dist/ReactToastify.css';
import styles from '@/styles/Dashboard.module.css';

export default function DashboardPage({ events, token }) {
  const router = useRouter();

  const deleteEvent = async (documentId) => {
    if (confirm('Are you sure?')) {
      try {
        const res = await fetch(`${API_URL}/api/events/${documentId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error?.message || 'Something went wrong');
        } else {
          // Safe navigation strategy: Push to home or explicitly push back to refresh values cleanly
          router.replace('/account/dashboard');
        }
      } catch (error) {
        toast.error('Network failure trying to handle request.');
      }
    }
  };

  return (
    <Layout title="User Dashboard">
      <div className={styles.dash}>
        <ToastContainer />{' '}
        {/* Fixed: Missing container for notifications to pop up */}
        <h1>Dashboard</h1>
        <h3>My Events</h3>
        {events && events.length > 0 ? (
          events.map((evt) => (
            // Fixed: Use documentId as your key component map identifier
            <DashboardEvent
              key={evt.documentId}
              evt={evt}
              handleDelete={deleteEvent}
            />
          ))
        ) : (
          <p>You have not created any events yet.</p>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ req }) {
  const cookies = parseCookies(req);
  const token = cookies.token || null;

  if (!token) {
    return {
      redirect: {
        destination: '/account/login',
        permanent: false,
      },
    };
  }

  // Fetch user profile alongside its associated events array
  const userRes = await fetch(
    `${API_URL}/api/users/me?populate[events][populate]=image`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!userRes.ok) {
    return {
      redirect: {
        destination: '/account/login',
        permanent: false,
      },
    };
  }

  const user = await userRes.json();
  const rawEvents = user.events || [];

  // FIXED FOR STRAPI V5: Deduplicate the array by tracking unique documentIds.
  // This automatically strips out the hidden internal Draft duplicates.
  const seenIds = new Set();
  const uniqueEvents = rawEvents.filter((evt) => {
    // If the item doesn't have a documentId, or we already processed it, skip it
    if (!evt.documentId || seenIds.has(evt.documentId)) {
      return false;
    }
    seenIds.add(evt.documentId);
    return true;
  });

  return {
    props: {
      events: uniqueEvents,
      token,
    },
  };
}
