import { parseCookies } from '@/helpers/index'; // Fixed: Uncommented cookie parsing helper
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { API_URL } from '@/config/index';
import styles from '@/styles/Form.module.css';

export default function AddEventPage({ token }) {
  const [values, setValues] = useState({
    name: '',
    performers: '',
    venue: '',
    address: '',
    date: '',
    time: '',
    description: '',
  });

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const hasEmptyFields = Object.values(values).some(
      (element) => element === '',
    );

    if (hasEmptyFields) {
      toast.error('Please fill in all fields');
      return;
    }

    // Destructure description out so ...formFields does NOT include the plain text string
    const { description, ...formFields } = values;

    const payload = {
      ...formFields, // Includes name, performers, venue, address, date, time
      description: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: description }],
        },
      ],
    };

    const res = await fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Fixed: Activated auth headers to secure the submission
      },
      body: JSON.stringify({ data: payload }),
    });

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        toast.error('Session expired. Please log in again.');
        return;
      }
      toast.error(json.error?.message || 'Something Went Wrong');
    } else {
      // In Strapi v5, attributes are flattened into json.data directly
      router.push(`/events/${json.data.slug}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  return (
    <Layout title="Add New Event">
      <Link href="/events">Go Back</Link>
      <h1>Add Event</h1>
      <ToastContainer />
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div>
            <label htmlFor="name">Event Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={values.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="performers">Performers</label>
            <input
              type="text"
              name="performers"
              id="performers"
              value={values.performers}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="venue">Venue</label>
            <input
              type="text"
              name="venue"
              id="venue"
              value={values.venue}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="address">Address</label>
            <input
              type="text"
              name="address"
              id="address"
              value={values.address}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="date">Date</label>
            <input
              type="date"
              name="date"
              id="date"
              value={values.date}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="time">Time</label>
            <input
              type="text"
              name="time"
              id="time"
              value={values.time}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description">Event Description</label>
          <textarea
            name="description"
            id="description"
            value={values.description}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <input type="submit" value="Add Event" className="btn" />
      </form>
    </Layout>
  );
}

// Fixed: Active Server Side token retrieval and page access protection
export async function getServerSideProps({ req }) {
  const cookies = parseCookies(req);
  const token = cookies.token || null;

  // Protect the route: Redirect unauthenticated users back to login instantly
  if (!token) {
    return {
      redirect: {
        destination: '/account/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      token,
    },
  };
}
